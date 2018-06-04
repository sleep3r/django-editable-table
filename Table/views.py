from django.shortcuts import render, redirect
from Table.forms import JsonForm, TableForms
from Table.models import JsonTable
from django.views.generic import TemplateView, DeleteView, View
from django.db import transaction

import json


class HomeView(TemplateView):
    template_name = 'index.html'
    model = JsonTable
    form = TableForms
    json_form = JsonForm

    def post(self, request):
        json_form = self.json_form(request.POST)

        if json_form.is_valid():
            with transaction.atomic():
                for row, table_data in zip(self.model.objects.all(), json_form.cleaned_data['data']):
                    row.data = table_data
                    row.save()
                
        return redirect('home')
    
    @property
    def get_context_data(self, *args, **kwargs):
        table = [json.loads(string['data']) for string in self.model.objects.values()]
        
        id_list = [row['id'] for row in self.model.objects.values('id')]
        
        if len(table) != 0: col_list = list((table[0].keys()))
        else: col_list = None
        
        if len(table) != 0: pattern = json.dumps(dict.fromkeys(list(table[0].keys()), ""))
        else: pattern = {}

        return {'table': table, 'id_list': id_list, 'form': self.form, 'col_list': col_list, "pattern": pattern, "json_form": self.json_form}

    
    def get(self, request):
        return render(request, self.template_name, self.get_context_data)



class DeleteRows(DeleteView):
    model = JsonTable
    success_url = '/'

    def delete(self, request, *args, **kwargs):
        if len(self.model.objects.all()) == 1:
            pattern = request.POST.get('del_row')
            super(DeleteRows, self).delete(request, *args, **kwargs)
            self.model.objects.create(data=json.loads(pattern))
            return redirect('home')

        else: return super(DeleteRows, self).delete(request, *args, **kwargs)


class DeleteCols(View):
    model = JsonTable

    def post(self, request):
        col_name = request.POST.get('del_col')
        col_name_list = request.POST.get('del_col_list')
        col_name_list = col_name_list.split(',')

        if len(col_name_list) == 1:
            self.model.objects.all().delete()
            self.model.objects.create()
            
        else:
            with transaction.atomic():
                for row in self.model.objects.all():
                    row.data.pop(col_name, None)
                    row.save()

        return redirect('home')


class CreateRow(View):
    model = JsonTable
   
    def post(self, request):
        pattern = request.POST.get('add_row')
        self.model.objects.create(data=json.loads(pattern))
        return redirect('home')


class CreateCol(View):
    model = JsonTable
    form = TableForms

    def post(self, request):
        form = self.form(request.POST)
        if form.is_valid():
            with transaction.atomic():
                for row in self.model.objects.all():
                    row.data[form.cleaned_data['add_column']] = ""
                    row.save()
        return redirect('home')

