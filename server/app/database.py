from app.config import conf_dbtype, conf_db

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine, select

import app.models as models

if(conf_dbtype() == "sqlite"):
    DATABASE_URL = f"sqlite:///{conf_db()}"
else:
    DATABASE_URL = f"sqlite:///{conf_db()}"

engine = create_engine(DATABASE_URL, echo=False)

def init_db() -> None:
    models.init_models(engine)
    with Session(engine) as session:
        if session.exec(select(models.rolesLuLocation)).first() is None:
            location = models.rolesLuLocation(Country="Ireland", City="", IsActive=True, Order=1)
            session.add(location)
            session.flush()

            roleType = models.rolesLuRoleType(Name="Permanent", IsActive=True, Order=1)
            session.add(roleType)
            roleType = models.rolesLuRoleType(Name="Contract", IsActive=True, Order=2)
            session.add(roleType)
            roleType = models.rolesLuRoleType(Name="Full-Time", IsActive=True, Order=3)
            session.add(roleType)
            session.flush()

            workModel = models.rolesLuWorkModel(Name="On site", IsActive=True, Order=1)
            session.add(workModel)
            workModel = models.rolesLuWorkModel(Name="Remote", IsActive=True, Order=2)
            session.add(workModel)
            workModel = models.rolesLuWorkModel(Name="Hybrid", IsActive=True, Order=3)
            session.add(workModel)
            session.flush()

            benefit = models.rolesLuBenefit(Name="Health Insurance", IsActive=True, Order=1)
            session.add(benefit)
            benefit = models.rolesLuBenefit(Name="Pension Plan", IsActive=True, Order=2)
            session.add(benefit)
            benefit = models.rolesLuBenefit(Name="Bonus", IsActive=True, Order=3)
            session.add(benefit)
            benefit = models.rolesLuBenefit(Name="Vacation", IsActive=True, Order=4)
            session.add(benefit)
            benefit = models.rolesLuBenefit(Name="Commuting allowance", IsActive=True, Order=5)
            session.add(benefit)
            session.flush()

            benefit = models.rolesSource(Name="Internal Reference", Details="A contact reference on their company.", IsActive=True)
            session.add(benefit)
            session.flush()

            setting = models.appSetting(Key="db_version", Value="1.0.0", Notes="Version control of the last deployed database.", IsActive=True);
            session.add(setting)
            setting = models.appSetting(Key="OLLAMA_URL", Value="http://localhost:11434", Notes="Ollama API listening URL.", IsActive=True);
            session.flush()
            setting = models.appSetting(Key="OLLAMA_API_KEY", Value="", Notes="Security API key for calling Ollama.", IsActive=True);
            session.flush()
            setting = models.appSetting(Key="OLLAMA_MODEL", Value="gemma4:latest", Notes="LLM model installed in Ollama.", IsActive=True);
            session.flush()
            setting = models.appSetting(Key="OLLAMA_SYSTEM_PROMPT", Value="You are an an expert career manager, your goal is to help users optimise their resumes for job applications. Follow these steps to provide effective guidance: \
- When a job specification is provided, analyse the target job description and suggest relevant keywords to align the resume with the job requirements and increase chances of passing applicant tracking systems (ATS). Extract from it key points such as role, company, sector, skill set desired, technologies, and provide a honest opinion, highlighting any red flag you may notice. \
- If a resume is also provided, match it with the job description, and add to the role analysis your honest opinion of the qualification of the user for the role, strengths, weaknesses, keep it realistic. Give honest advice to the user. As final point, provide in percentage, the match of the resume to the role. \
- Keep your responses brief and concise, be realistic with your analysis, always with a professional tone, avoid using emojis or any other non professional expressions. \
- You must provide citations to the job spec, resume, or any other source for your statements. \
- Remember to keep personal information confidential and secure at all times.", Notes="System prompt for Ollama requests.", IsActive=True);
            session.flush()
            setting = models.appSetting(Key="OLLAMA_KNOWLEDGE_SOURCE", Value="", Notes="Full name of text file with the users resume to be used in queries.", IsActive=True);
            session.flush()

            session.commit()

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
