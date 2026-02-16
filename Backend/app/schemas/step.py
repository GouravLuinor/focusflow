from pydantic import BaseModel


class StepCreate(BaseModel):
    content: str
    order: int


class StepUpdate(BaseModel):
    content: str | None = None
    is_completed: bool | None = None


class StepResponse(BaseModel):
    id: int
    content: str
    order: int
    is_completed: bool

    class Config:
        from_attributes = True
