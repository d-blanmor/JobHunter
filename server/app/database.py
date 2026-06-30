from app.config import conf_dbtype, conf_db

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine, select

from app.models import LuLocation, LuRoleType, LuWorkModel, LuBenefit

if(conf_dbtype() == "sqlite"):
    DATABASE_URL = f"sqlite:///{conf_db()}"
else:
    DATABASE_URL = f"sqlite:///{conf_db()}"

engine = create_engine(DATABASE_URL, echo=False)

def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        if session.exec(select(LuLocation)).first() is None:
            location = LuLocation(Country="Ireland", City="", IsActive=True, Order=1)
            session.add(location)
            session.flush()
            roleType = LuRoleType(Name="Permanent", IsActive=True, Order=1)
            session.add(roleType)
            roleType = LuRoleType(Name="Contract", IsActive=True, Order=2)
            session.add(roleType)
            roleType = LuRoleType(Name="Full-Time", IsActive=True, Order=3)
            session.add(roleType)
            session.flush()
            workModel = LuWorkModel(Name="On site", IsActive=True, Order=1)
            session.add(workModel)
            workModel = LuWorkModel(Name="Remote", IsActive=True, Order=2)
            session.add(workModel)
            workModel = LuWorkModel(Name="Hybrid", IsActive=True, Order=3)
            session.add(workModel)
            session.flush()
            benefit = LuBenefit(Name="Health Insurance", IsActive=True, Order=1)
            session.add(benefit)
            benefit = LuBenefit(Name="Pension Plan", IsActive=True, Order=2)
            session.add(benefit)
            benefit = LuBenefit(Name="Bonus", IsActive=True, Order=3)
            session.add(benefit)
            benefit = LuBenefit(Name="Vacation", IsActive=True, Order=4)
            session.add(benefit)
            benefit = LuBenefit(Name="Commuting allowance", IsActive=True, Order=5)
            session.add(benefit)
            session.flush()
            session.commit()

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
