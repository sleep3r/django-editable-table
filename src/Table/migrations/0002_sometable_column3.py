# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-05-29 19:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Table', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sometable',
            name='column3',
            field=models.TextField(blank=True, null=True),
        ),
    ]