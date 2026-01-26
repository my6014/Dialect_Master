from pydantic import BaseModel
from typing import List
from .user import UserPublicProfile

class FollowResponse(BaseModel):
    message: str
    is_following: bool

class FollowerListResponse(BaseModel):
    items: List[UserPublicProfile]
    total: int
    page: int
    size: int

class FollowingListResponse(BaseModel):
    items: List[UserPublicProfile]
    total: int
    page: int
    size: int
