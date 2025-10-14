from typing import List, Optional
from ..models import Aluno
from .base_repository import BaseRepository

class AlunoRepository(BaseRepository):
    
    def get_all(self) -> List[Aluno]:
        return Aluno.objects.filter(is_active=True)

    def get_by_id(self, id: int) -> Optional[Aluno]:
        try:
            return Aluno.objects.get(pk=id, is_active=True)
        except Aluno.DoesNotExist:
            return None
    
    def create(self, data: dict) -> Aluno:
        aluno = Aluno.objects.create(**data)
        return aluno

    def update(self, id: int, data: dict) -> Optional[Aluno]:
        aluno = self.get_by_id(id)
        if aluno:
            for key, value in data.items():
                setattr(aluno, key, value)
            aluno.save()
            return aluno
        return None

    def delete(self, id: int) -> bool:
        aluno = self.get_by_id(id)
        if aluno:
            aluno.is_active = False
            aluno.save()
            return True
        return False
