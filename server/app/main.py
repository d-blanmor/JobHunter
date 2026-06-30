from fastapi import FastAPI
from .routers import (
    initiate,
    lu_locations,
    lu_roletypes,
    lu_workmodels,
    lu_benefits,
    sources,
    placesofwork,
    contacts,
    applications,
    jobspecs,
    interviews,
    lnk_jobspec_benefits,
    logic,
)

app = FastAPI(title="JobHunter API", version="0.1.0")

app.include_router(initiate.router)
app.include_router(lu_locations.router)
app.include_router(lu_roletypes.router)
app.include_router(lu_workmodels.router)
app.include_router(lu_benefits.router)
app.include_router(sources.router)
app.include_router(placesofwork.router)
app.include_router(contacts.router)
app.include_router(applications.router)
app.include_router(jobspecs.router)
app.include_router(interviews.router)
app.include_router(lnk_jobspec_benefits.router)
app.include_router(logic.router)
