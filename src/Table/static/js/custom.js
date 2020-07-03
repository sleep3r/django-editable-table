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
        $('#id_data').val(JSON.stringify(table_obj.serialize().reverse()));
        $('#save-form').submit()
    });
    $("#add_row").click(function() {
        $("#add-row-form").submit()
    });
    $("#add_col").click(function() {
        var name,
            z = 0;
        do {
            if (z>0) throwErr()
            name = prompt('Type new column name:');
            z++
        } while (/^\d+$/.test(name) == true)
        $('input#id_add_column').val(name);
        $('#add-col-form').submit()
    });
    $('.table-app__row-action i').click(function() {
        if (confirm('Delete this row?')) {
            $('#del-row-form').attr('action', '/delete-row/'+$(this).attr('del_row')+'/');
            $('#del-row-form').submit()
        }
    });
    $('.table-app__col-action i:first-child').click(function() {
        if (confirm('Delete this column?')) {
            $('#del-col-form input:nth-child(2)').val(cols[$(this).attr('del_col')]);
            $('#del-col-form input:last-child').val(cols);
            $('#del-col-form').submit()
        }
    });
    $('.table-app__col-action i:last-child').click(function() {
        var new_key,
            k = 0;
        var old_ind = parseInt($(this).attr('col_ind'));
        do {
            if (k>0) throwErr()
            new_key = prompt('Type new column name:');
            k++
        } while (/^\d+$/.test(new_key) == true)
        var old_key = cols[old_ind];
        if (new_key) {
            var obj = {},
                th_el;
            th_el = $('th')[old_ind];
            $('th:nth-child('+(old_ind+1)+')').text(new_key);
            cols[cols.indexOf(old_key)] = new_key;
            for (name of cols) {
                if (table_obj.fields[name])
                    obj[name] = table_obj.fields[name]
                else
                    obj[name] = table_obj.fields[old_key]
            }
            table_obj.fields = obj;
            updateAct(th_el, col_act)
        }
    });

    for (col_name of cols) {
        fields[col_name] = { "class": "edit", "type": "string" }
    }
    console.log(fields);
    for (i=0;i<_root.length;i++) {
        var tmp = [];
        for (var key in _root[i]) tmp.push(_root[i][key])
        data.unshift(tmp);
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
        updateAct(this, col_act)
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

function throwErr() {
    alert('Column name should not only contain digits!')
}

function updateAct(arg, act_el) {
    var col = $(arg);
    var ind = $('th').index(arg);
    act_el.find('i:first-child').attr('del_col', ind);
    act_el.find('i:last-child').attr('col_ind', ind);
    var tmp = col.offset().left+col.outerWidth()/2;
    setTimeout(function() {act_el.css('left', tmp-act_el.width()/2)+"px"}, 100)
}