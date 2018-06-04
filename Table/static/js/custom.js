var table_obj,
    fields = new Object(),
    data = [];
const MDCIconToggle = mdc.iconToggle.MDCIconToggle;

$(document).ready(function() {

    var col_act = $('.table-app__col-action'),
        row_act = $('.table-app__row-action'),
        row_act_delta = 0;

    if (!cols.length) $("#add_row").remove()

    $("#save").click(function() {
        if ($('.has_input').length) $('.table-app__title').click();
        $('#id_data').val(JSON.stringify(table_obj.serialize("asc")));
        $('#save-form').submit()
    });
    $("#add_row").click(function() {
        $("#add-row-form").submit()
    });
    $("#add_col").click(function() {
        var name = prompt('Введите название столбца:');
        $('input#id_add_column').val(name);
        $('#add-col-form').submit()
    });
    $('.table-app__row-action i').click(function() {
        if (confirm('Вы хотите удалить эту строку?')) {
            $('#del-row-form').attr('action', '/delete-row/'+$(this).attr('del_row')+'/');
            $('#del-row-form').submit()
        }
    });
    $('.table-app__col-action i:first-child').click(function() {
        if (confirm('Вы хотите удалить этот столбец?')) {
            $('#del-col-form input:nth-child(2)').val(cols[$(this).attr('del_col')]);
            $('#del-col-form input:last-child').val(cols);
            $('#del-col-form').submit()
        }
    });
    $('.table-app__col-action i:last-child').click(function() {
        var old_ind = parseInt($(this).attr('col_ind'));
        var new_key = prompt('Введите новое название столбца:');
        var old_key = cols[old_ind];
        if (new_key) {
            var obj = {};
            $('th:nth-child('+(old_ind+1)+')').text(new_key);
            cols[cols.indexOf(old_key)] = new_key;
            for (name of cols) {
                if (table_obj.fields[name])
                    obj[name] = table_obj.fields[name]
                else
                    obj[name] = table_obj.fields[old_key]
            }
            table_obj.fields = obj
        }
    });

    for (col_name of cols) {
        fields[col_name] = { "class": "edit", "type": "string" }
    }
    for (i=0;i<_root.length;i++) {
        var tmp = [];
        for (var key in _root[i]) tmp.push(_root[i][key])
        data.unshift(tmp)
    }
    table_obj = new Table({
        id: "root",
        fields: fields,
        data: data,
        direction: "desc"
    });
    table_obj.render()

    $('.mdc-icon-toggle').each(function (i,el) {
        MDCIconToggle.attachTo(el);
    });

    $('th').mouseover(function() {
        var col = $(this);
        var ind = $('th').index(this);
        col_act.find('i:first-child').attr('del_col', ind);
        col_act.find('i:last-child').attr('col_ind', ind);
        var tmp = col.offset().left+col.outerWidth()/2;
        setTimeout(function() {col_act.css('left', tmp-col_act.width()/2)+"px"}, 100)
    });
    $('tbody tr').mouseover(function() {
        var row = $(this),
            check = row_act.hasClass('active');
        row_act.find('i').attr('del_row', id_all[$('tbody tr').index(this)]);
        var tmp = row.offset().top+row.height()/2-$('header').outerHeight();
        row_act.css('left', row.offset().left-row_act.width()+"px");
        setTimeout(function() {
            if (!check) row_act.addClass('active')
            row_act.css('top', tmp-row_act.height()/2+"px")
        }, 100)
    });
    $('tbody').mouseleave(function() {
        setTimeout(function() {
            if (!row_act.is(':hover')) row_act.removeClass('active')
        }, 300)
    });
    row_act.mouseleave(function() { row_act.removeClass('active') })
});