from abc import ABC, abstractmethod
from typing import List, Optional
from django.db.models import Model

class BaseRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Model]:
        pass

    @abstractmethod
    def get_by_id(self, id: int) -> Optional[Model]:
        pass

    @abstractmethod
    def create(self, data: dict) -> Model:
        pass

    @abstractmethod
    def update(self, id: int, data: dict) -> Optional[Model]:
        pass
    
    @abstractmethod
    def delete(self, id: int) -> bool:
        pass
