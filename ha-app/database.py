from config import conf_dbtype, conf_db

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine, select

from models import rolesLuLocation, rolesLuRoleType, rolesLuWorkModel, rolesLuBenefit, rolesSource

if(conf_dbtype() == "sqlite"):
    DATABASE_URL = f"sqlite:///{conf_db()}"
else:
    DATABASE_URL = f"sqlite:///{conf_db()}"

engine = create_engine(DATABASE_URL, echo=False)

def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        if session.exec(select(rolesLuLocation)).first() is None:
            location = rolesLuLocation(Country="Ireland", City="", IsActive=True, Order=1)
            session.add(location)
            session.flush()

            roleType = rolesLuRoleType(Name="Permanent", IsActive=True, Order=1)
            session.add(roleType)
            roleType = rolesLuRoleType(Name="Contract", IsActive=True, Order=2)
            session.add(roleType)
            roleType = rolesLuRoleType(Name="Full-Time", IsActive=True, Order=3)
            session.add(roleType)
            session.flush()

            workModel = rolesLuWorkModel(Name="On site", IsActive=True, Order=1)
            session.add(workModel)
            workModel = rolesLuWorkModel(Name="Remote", IsActive=True, Order=2)
            session.add(workModel)
            workModel = rolesLuWorkModel(Name="Hybrid", IsActive=True, Order=3)
            session.add(workModel)
            session.flush()

            benefit = rolesLuBenefit(Name="Health Insurance", IsActive=True, Order=1)
            session.add(benefit)
            benefit = rolesLuBenefit(Name="Pension Plan", IsActive=True, Order=2)
            session.add(benefit)
            benefit = rolesLuBenefit(Name="Bonus", IsActive=True, Order=3)
            session.add(benefit)
            benefit = rolesLuBenefit(Name="Vacation", IsActive=True, Order=4)
            session.add(benefit)
            benefit = rolesLuBenefit(Name="Commuting allowance", IsActive=True, Order=5)
            session.add(benefit)
            session.flush()

            benefit = rolesSource(Name="Internal Reference", Details="A contact reference on their company.", IsActive=True)
            session.add(benefit)
            session.flush()

            session.commit()

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
