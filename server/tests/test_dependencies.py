from sqlmodel import Session, SQLModel, create_engine

from app.dependencies import _get_link_or_404
from app.models import rolesLnkJobSpecTags


def test_get_link_or_404_with_partial_primary_key_returns_matching_rows() -> None:
    engine = create_engine("sqlite://")
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        session.add(rolesLnkJobSpecTags(JobSpecId=7, TagId=11))
        session.commit()

        links = _get_link_or_404(session, rolesLnkJobSpecTags, pk1=7, pk2=None)

        assert len(links) == 1
        assert links[0].JobSpecId == 7
        assert links[0].TagId == 11
