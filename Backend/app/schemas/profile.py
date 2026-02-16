from pydantic import BaseModel


class ProfileCreate(BaseModel):
    support_mode: str


class ProfileResponse(BaseModel):
    id: int
    support_mode: str
    onboarding_completed: bool

    class Config:
        from_attributes = True
