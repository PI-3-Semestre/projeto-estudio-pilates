from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from django.db.models import F
from .models import Venda, Produto, VendaProduto

@receiver(m2m_changed, sender=Venda.produtos.through)
def baixar_estoque_apos_venda(sender, instance, action, pk_set, **kwargs):
    """
    Signal que roda DEPOIS que os VendaProduto são adicionados a uma Venda.
    
    :param sender: O model VendaProduto
    :param instance: A instância da Venda que foi modificada
    :param action: A ação que disparou o sinal (ex: 'post_add')
    :param pk_set: Um set() com as Primary Keys dos VendaProduto
                   que foram adicionados.
    """
    if action == 'post_add':
        
        if not pk_set:
            return
        itens_vendidos = VendaProduto.objects.filter(pk__in=pk_set)
        
        for item in itens_vendidos:
            produto = item.produto
            quantidade_vendida = item.quantidade
            Produto.objects.filter(pk=produto.pk).update(
                quantidade_estoque=F('quantidade_estoque') - quantidade_vendida
            )
            