# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-05-31 16:26
from __future__ import unicode_literals

from django.db import migrations, models
import jsonfield.fields


class Migration(migrations.Migration):

    dependencies = [
        ('Table', '0006_auto_20180531_1904'),
    ]

    operations = [
        migrations.CreateModel(
            name='JsonTable',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False, unique=True, verbose_name='')),
                ('data', jsonfield.fields.JSONField(default={})),
            ],
            options={
                'db_table': 'JsonTable',
                'managed': True,
            },
        ),
        migrations.DeleteModel(
            name='SomeTable',
        ),
    ]
