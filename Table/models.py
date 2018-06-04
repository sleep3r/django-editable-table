from django.db import models
from jsonfield import JSONField
#from django.contrib.postgres.fields import JSONField


class JsonTable(models.Model):
    id = models.IntegerField(unique=True, primary_key=True)
    data = JSONField(default={})

    
    class Meta():
        managed = True 
        db_table = 'JsonTable'
        




