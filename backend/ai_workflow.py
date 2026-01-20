from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings  # Updated package name
from langchain_community.document_loaders import PyPDFLoader  # Correct location
from langchain_community.vectorstores import FAISS
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph
from typing import TypedDict, List
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(temperature=0, model="llama-3.1-8b-instant", api_key=os.getenv("GROQ_API_KEY"))

class State(TypedDict):
    resume_path: str
    job_dept: str
    resume_text: str
    evaluation: str
    score: float
    ranking: str
    interview_questions: List[str]
    name: str

def parse_resume(state: State) -> State:
    loader = PyPDFLoader(state["resume_path"])
    docs = loader.load()
    state["resume_text"] = "\n".join(doc.page_content for doc in docs)
    # Simple name extraction (first line or heuristic)
    state["name"] = state["resume_text"].split("\n")[0].strip() if state["resume_text"] else "Unknown"
    return state

def rag_evaluate(state: State) -> State:
    # Hardcoded job description (customize per dept)
    job_desc = f"Required for {state['job_dept']} Faculty: PhD in relevant field, 5+ years teaching experience, publications in reputed journals, strong research background."
    
    # Embeddings and vector store for RAG
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    documents = [job_desc, state["resume_text"]]
    vectorstore = FAISS.from_texts(documents, embeddings)
    retriever = vectorstore.as_retriever()

    # RAG QA chain
    system_prompt = "You are an assistant for evaluating resumes. Use the provided context to evaluate how well the resume matches the job."
    qa_prompt = ChatPromptTemplate.from_messages(
        [("system", system_prompt), ("human", "{input}\nContext: {context}")]
    )
    question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    response = rag_chain.invoke({"input": "Evaluate the resume's match to the job description."})
    state["evaluation"] = response["answer"]
    return state

def score_candidate(state: State) -> State:
    prompt = ChatPromptTemplate.from_template(
        "Based on this evaluation: {evaluation}\nScore the candidate from 0-100."
    )
    chain = prompt | llm
    score_str = chain.invoke({"evaluation": state["evaluation"]}).content.strip()
    try:
        state["score"] = float(score_str)
    except ValueError:
        state["score"] = 50.0
    state["ranking"] = "High" if state["score"] > 80 else "Medium" if state["score"] > 50 else "Low"
    return state

def generate_questions(state: State) -> State:
    prompt = ChatPromptTemplate.from_template(
        "Generate 5 relevant interview questions for a {job_dept} faculty position based on this resume: {resume_text}"
    )
    chain = prompt | llm
    questions_str = chain.invoke({"job_dept": state["job_dept"], "resume_text": state["resume_text"]}).content
    state["interview_questions"] = [q.strip() for q in questions_str.split("\n") if q.strip() and q[0].isdigit()]
    return state

# LangGraph workflow
workflow = StateGraph(state_schema=State)
workflow.add_node("parse", parse_resume)
workflow.add_node("evaluate", rag_evaluate)
workflow.add_node("score", score_candidate)
workflow.add_node("questions", generate_questions)

workflow.add_edge("parse", "evaluate")
workflow.add_edge("evaluate", "score")
workflow.add_edge("score", "questions")
workflow.set_entry_point("parse")
workflow.set_finish_point("questions")

graph = workflow.compile()

def run_ai_workflow(resume_path: str, job_dept: str) -> dict:
    inputs = {"resume_path": resume_path, "job_dept": job_dept}
    return graph.invoke(inputs)