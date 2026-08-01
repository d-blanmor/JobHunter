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

            setting = models.appSetting(Key="db_version", 
                                        Value="1.0.0", 
                                        Notes="Version control of the last deployed database.", 
                                        IsActive=True);
            session.add(setting)
            setting = models.appSetting(Key="OLLAMA_URL", 
                                        Value="http://localhost:11434", 
                                        Notes="Ollama API listening URL.", 
                                        IsActive=True);
            session.add(setting)
            setting = models.appSetting(Key="OLLAMA_API_KEY", 
                                        Value="", 
                                        Notes="Security API key for calling Ollama.", 
                                        IsActive=True);
            session.add(setting)
            setting = models.appSetting(Key="OLLAMA_MODEL", 
                                        Value="gemma4:latest", 
                                        Notes="LLM model installed in Ollama.", 
                                        IsActive=True);
            session.add(setting)
            setting = models.appSetting(Key="OLLAMA_SYSTEM_PROMPT", 
                                        Value="""You are an an expert career manager, your goal is to help the user analysing job specifications and preparing applications and interviews. 
Follow these steps to provide effective guidance:
- Keep messages brief, clear and professional, never use emoticons or images, keep it in text with markdown format.
- Your first goal is to help the user selecting the roles to apply, be hobest and realistic, never try to please the user.
- When the user decides to apply to a jobspect, your goal is to help the user preparing the application, may include helping writting cover letter or other documents to support the application.
- Always be realistic on your analysis.
- You must provide citations to the job spec, resume, or any other source for your statements.
- Remember to keep personal information confidential and secure at all times.""", 
                                        Notes="System prompt for Ollama requests.", 
                                        IsActive=True);
            session.add(setting)
            setting = models.appSetting(Key="OLLAMA_PROMPT_ANALYSE_JOBSPEC", 
                                        Value="""Analyse the following jobspec providing the following sections in markdown format:
- Details about the role, company, sector, place of work, role type, work model and offered salary and benefits.
- Simple list of technologies and experience required for the job.
- List of red flags and concerns about the specifications.
- Score the role from 1 to 10 based on the description and requirements.
                                        """, 
                                        Notes="Prompt used to analyse JobSpecs.", 
                                        IsActive=True);
            session.add(setting)
            setting = models.appSetting(Key="OLLAMA_PROMPT_MATCH_PROFILE", 
                                        Value="""
Match the user profile with the following jobspec, and provide the user with a honest description of strenghts and weaknes for the user to apply.
                                        """, 
                                        Notes="Prompt used to match a jobspec with a CV.", 
                                        IsActive=True);
            session.add(setting)
            setting = models.appSetting(Key="OLLAMA_PROMPT_GENERATE_COVER_LETTER", 
                                        Value="""
Having in mind the user profile, write a cover letter for the user to use on an application to the following job spec.
                                        """, 
                                        Notes="Prompt used to write a cover letter for a specific job based on the user profile.", 
                                        IsActive=True);
            session.add(setting)
            setting = models.appSetting(Key="OLLAMA_KNOWLEDGE_SOURCE", 
                                        Value="", 
                                        Notes="Full name of text file with the users resume to be used in queries.", 
                                        IsActive=True);
            session.add(setting)
            session.flush()

            session.commit()

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
