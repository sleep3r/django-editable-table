from django import forms

from .models import JsonTable


class JsonForm(forms.ModelForm):
    class Meta():
        model = JsonTable
        fields = ['data',]
        widgets = {'data': forms.HiddenInput()}

class TableForms(forms.Form):
    add_column = forms.CharField(widget = forms.HiddenInput())
