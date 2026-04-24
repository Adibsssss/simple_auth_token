from django.db import models
from django.contrib.auth.models import User


class Item(models.Model):
    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    quantity    = models.PositiveIntegerField(default=0)
    price       = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_by  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'items'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
