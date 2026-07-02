from fastapi import FastAPI

from .routers.workflows import stages

from .routers import (
    initiate,
    tags,
)
from .routers.roles import (
    lu_benefits, 
    lu_locations, 
    lu_roletypes, 
    lu_workmodels, 
    contacts, 
    applications, 
    interviews, 
    offers,
    jobspecs, 
    lnk_jobspecs_benefits, 
    lnk_offers_benefits,
    lnk_jobspecs_tags, 
    placesofwork, 
    sources,
)

app = FastAPI(title="JobHunter API", version="0.1.0")

app.include_router(initiate.router)
app.include_router(tags.router)
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
app.include_router(offers.router)
app.include_router(lnk_jobspecs_benefits.router)
app.include_router(lnk_offers_benefits.router)
app.include_router(lnk_jobspecs_tags.router)
app.include_router(stages.router)
