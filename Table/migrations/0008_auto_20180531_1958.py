# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-05-31 16:58
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Table', '0007_auto_20180531_1926'),
    ]

    operations = [
        migrations.RenameField(
            model_name='jsontable',
            old_name='data',
            new_name='string',
        ),
    ]
