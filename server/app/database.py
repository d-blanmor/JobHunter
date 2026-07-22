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

            setting = models.appSetting(Key="db_version", Value="1.0.0", Notes="Version control of the last deployed database", IsActive=True);
            session.add(setting)
            session.flush()

            session.commit()

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
