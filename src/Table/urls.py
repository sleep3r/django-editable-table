from django.conf.urls import url
from Table.views import HomeView, DeleteRows, CreateCol, CreateRow, DeleteCols



urlpatterns = [
    url(r'^$', HomeView.as_view(), name='home'),
    url(r'^delete-row/(?P<pk>\d+)/$', DeleteRows.as_view(), name='delete_rows'),
    url(r'^add-col/', CreateCol.as_view(), name='add_col'),
    url(r'^add-row/', CreateRow.as_view(), name='add_row'),
    url(r'^delete-col/$', DeleteCols.as_view(), name='delete_cols'),

   
]
