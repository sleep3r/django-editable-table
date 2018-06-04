function Table (o) {

    var s = o || {};

    // Debug messages to console.log
    this.debug = s.debug || false;
    // Set the id of the table
    this._id(s.id);
    // Data as Array of Arrays
    this.data = s.data || [];
    // Fields as Key Objects pairs
    this.fields = s.fields || {};
    // Direction
    this.direction = s.direction || "asc";

    this.log("Initializing Table"+this.id);
    this._init();

    return;
}

Table.prototype._init = function() {

    // Set initial data types
    this._datatypes();

    // Attach events
    this._events();
}

Table.prototype._calc = function(id, o) {

    var self = this;

    var pos = this._position(id);
    var cols = this._count("cols", "table") -1;
    var rows = this._count("rows", "table") -1;    

    var val;

    for (var i=0; i<o.length; i++) {
        for (var op in o[i]) {

            var param = o[i][op];

            if ( param.length !== 2 ) {
                self.log("Insufficient parameters supplied to "+op+" function");
            }

            var c1 = (param[0].c) ? (Number(pos.col)+Number(param[0].c)) : Number(pos.col);
            var r1 = (param[0].r) ? (Number(pos.row)+Number(param[0].r)) : Number(pos.row);
            if ( self._inrange(c1, r1, cols, rows) === false ) { return ""; }

            var c2 = (param[1].c) ? (Number(pos.col)+Number(param[1].c)) : Number(pos.col);
            var r2 = (param[1].r) ? (Number(pos.row)+Number(param[1].r)) : Number(pos.row);
            if ( self._inrange(c2, r2, cols, rows) === false ) { return ""; }

            var id1 = pos.table_id+"_"+r1+"_"+c1;
            var x = (c1 == pos.col && r1 == pos.row) ? val : self._getcell(id1);

            var id2 = pos.table_id+"_"+r2+"_"+c2;
            var y = (c2 == pos.col && r2 == pos.row) ? val : self._getcell(id2);

            switch(op) {
                case "subtract":
                    val = (x - y);
                    break;
                case "sum":
                    val = (x + y);
                case "divide":
                    val = (x / y);
                    break;
                case "multiply":
                    val = (x * y);
                    break;
                case "datediff":
                    // IE doesn't accept dates as strings, resulting in NaN.
                    // Instead we'll use regex to parse the string and set
                    // the date using Date.setFullYear().
                    var rx = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/;
                    var xparts = rx.exec(x);
                    var yparts = rx.exec(y);
                    var day = 24*60*60*1000;

                    var d1 = new Date(NaN);
                    var d2 = new Date(NaN);
                    d1.setFullYear(xparts[1], (xparts[2] - 1), xparts[3]);
                    d2.setFullYear(yparts[1], (yparts[2] - 1), yparts[3]);

                    //self.log("("+ d1.getTime() +" - "+ d2.getTime() +") / "+day)
                    val = Math.round(Math.abs((d1.getTime()-d2.getTime())/(day)));
                    break;
            }

            self.log("Formula: "+op+"("+x+", "+y+") : "+val);
        }        
    }

    if ( isNaN(val) ) {
        val = "";
    }
    else {
        // Float
        if ( val - Math.floor(val) != 0 ) {
            val = parseFloat(val).toFixed(2);
        }
        // Int
        else {
            val = parseInt(val);
        }
    }

    return val;
}

Table.prototype._datatypes = function(type) {

    var self = this;

    // Set data types
    if ( this.datatypes === undefined ) {

        this.datatypes = {
            "calc": {
                "default": "",
                "placeholder": "",
                "format": function(val) { return val; },
                "formula": function(id, o) {
                    return self._calc(id, o);
                }
            },
            "date": {
                "default": "",
                "placeholder": "YYYY-MM-DD",
                "format": function(val) {
                    var d = new Date(val);
                    if ( d == "Invalid Date" || isNaN(d) ) {
                        return false;
                    }
                    return d.toISOString().slice(0,10);
                }
            },
            "float": {
                "default": "0.0",
                "placeholder": "",
                "format": function(val) {
                    val = String(val).replace(/[^\d\.\-]+/g, "");
                    if ( isNaN(val) ) { return false; }
                    return parseFloat(val).toFixed(2);
                }
            },
            "int": {
                "default": "0",
                "placeholder": "",
                "format": function(val) {
                    val = String(val).replace(/[^\d\-]+/g, "");
                    if ( isNaN(val) || ! /^[0-9]+$/.test(val) ) { 
                        return false;
                    }
                    return parseInt(val);
                }
            },
            "money": {
                "default": "0.00",
                "placeholder": "",
                "format": function(val) {
                    if ( val === undefined || val == "" ) { val = 0.00; }
                    val = String(val).replace(/[^\d\.\-]+/g, "");
                    if ( isNaN(val) ) { 
                        return false;
                    }
                    return parseFloat(val).toFixed(2);
                }
            },
            "string": {
                "default": "",
                "placeholder": "",
                "format": function(val) { return val; }
            }
        };

        // Set the data types in an easy lookup array
        this.types = [];

        for (var key in this.datatypes) {
            this.types.push(key);
        }
    }

    // Get specified data type
    if ( type !== undefined ) {

        if ( this.datatypes[type] !== undefined ) {
            
            return this.datatypes[type]
        }
        return false;
    }
}

Table.prototype._events = function() {

    var self = this;

    $(document).on("click", function(event) {

        var target = $(event.target);

        // Click an editable table cell
        if ( target.is("td") && target.hasClass("edit") && 
             target.parent("table"+self.id) ) {

            var cid = target.attr("id");

            // Save any cells open for edit except the one clicked
            $("table"+self.id+" > tbody > tr > td.edit")
                .children("input").each(function() {

                var oid = $(this).parent("td").attr("id")

                if ( oid !== cid ) {
                    self.saveCell(oid);
                }
            });

            // Save cell if its open for edit without error
            if (( $(target).children("input").length ) && 
                (! $(target).children("input").hasClass("error") )) {

                self.saveCell(cid);
            }
            // Edit cell
            else {

                self.editCell(cid);
                $(target).children("input").focus().select();
            }
        }
        // Click anywhere
        else {

            if ( target.is("input") && target.parent("td.edit") ) {

                self.log("clicked already open cell");
                target.focus().select();
            }
            else {

                // Save any editable cells
                $("table"+self.id+" > tbody > tr > td.edit")
                    .children("input").each(function() {

                    var cid = $(this).parent("td").attr('id');
                    self.saveCell(cid);
                });
            }
        }
    }).on('keydown', function(event) {

        var target = $(event.target);

        // Tab or Enter an editable cell
        if ( target.is("input") && target.parent("td.edit") ) {

            var code = (event.keyCode ? event.keyCode : event.which);
            var cid = $(target).parent("td").attr("id");

            switch(code) {
                case 9:
                    var editcells = $("table"+self.id+" > tbody").find("td.edit");

                    if ( event.shiftKey ) {
                        
                        for (var i=(editcells.length-1); i>=0; i--) {
                            
                            if ( $(editcells[i]).attr("id") == cid ) {

                                if ( editcells[(i-1)] === undefined ) {
                                    $(editcells[(editcells.length-1)]).click();
                                }
                                else {
                                    $(editcells[(i-1)]).click();
                                }
                            }
                        };
                    }
                    else {
                        
                        for (var i=0; i<editcells.length; i++) {
                            
                            if ( $(editcells[i]).attr("id") == cid ) {

                                if ( editcells[(i+1)] === undefined ) {
                                    $(editcells[0]).click();
                                }
                                else {
                                    $(editcells[(i+1)]).click();
                                }
                            }
                        };
                    }
                    event.stopPropagation();
                    return false;
                    break;
                case 13:
                    $(target).parent("td").click();
                    break;
            }
        }
    });
}

// Get or set id of table
Table.prototype._id = function(id) {

    // Get the table id
    if ( id === undefined ) {

        if ( this.id.charAt( 0 ) === '#' ) {
            return this.id.slice( 1 );
        }
        else {
            return this.id || "";
        }
    }
    // Set the table id
    else {

        this.id = "#"+id;
    }
}

Table.prototype._has = function(p) {

    switch (p) {
        case "data":
            if ( $.isArray(this.data) && this.data.length > 0 ) {
                return true;
            }
        case "fields":
            if (( $.isPlainObject(this.fields) ) && 
                ( ! $.isEmptyObject(this.fields) )) {
                return true;
            }
    }

    return false;
}

// Return a count of the existing rows
Table.prototype._count = function(p, src) {

    var p = p || "rows";
    var s = src || "table";

    switch(s) {
        case "data":
            switch(p) {
                case "cells":
                    return this.data.length * this.data[0].length; 
                case "cols":
                    return this.fields;
                case "rows":
                    return this.data.length;
                default:
                    return 0;
            }
            break;
        case "table":
            switch(p) {
                case "cells":
                    return $("table"+this.id+" > tbody").find("td").length;
                case "cols":
                    return $("table"+this.id+" > tbody > tr:first").find("td").length;
                case "rows":
                    return $("table"+this.id+" > tbody").find("tr").length;
                default:
                    return 0;
            }
            break;
    }
}

Table.prototype._inrange = function(c, r, col, row) {

    var cols = col || this._count("cols", "table") -1;
    var rows = row || this._count("rows", "table") -1;

    if ( c < 0 || c > cols ) {
        this.log("Col: "+c+" is out of range");
        return false;
    }
    if ( r < 0 || r > rows ) {
        this.log("Row: "+r+" is out of range");
        return false;
    }

    return true;
}

Table.prototype._getcell = function(id) {

    var self = this;

    if ( $("td#"+id) ) {

        var type = this._gettype(id);
        var val = "";

        if ( $("td#"+id).children("input").length ) {
            val = $("td#"+id+" > input").val();
        }
        else {
            val = $("td#"+id).text();
        }

        self.log("Cell: "+id+" has value: "+val);

        return val;
    }

    return false;
}

// Get the cell data type
Table.prototype._gettype = function(id) {

    if ( $("td#"+id) ) {

        var pos = this._position(id);

        var c = 0;
        for (field in this.fields) {
            if ( c == pos.col ) {
                return this.fields[field].type || "";
            }
            c++;
        }
    }
}

// Get the cell data type
Table.prototype._getfield = function(id) {

    if ( $("td#"+id) ) {

        var pos = this._position(id);

        var c = 0;
        for (field in this.fields) {
            if ( c == pos.col ) {
                return field || "";
            }
            c++;
        }
    }
}

// Test if a specified table exists
Table.prototype._isvalid = function() {

    if ( $("table"+this.id) === undefined ) {

        this.log("table"+this.id+" not found"); 
        return false;
    }

    return true;
}

// Get cell coordinates
Table.prototype._position = function(id) {

    if ( $("td#"+id) ) {

        var ids = id.match(/^((.+)_(\d+))_(\d+)$/) || [];
        // ["test_0_1", "test_0", "test", "0", "1", index: 0, input: "test_0_1"]

        if ( ids.length < 5 ) { return false; }

        return {
            "table_id": this._id(),
            "row_id": ids[1],
            "cell_id": id,
            "row": ids[3],
            "col": ids[4]
        };
    }

    return false;
}

// Debug logger
Table.prototype.log = function(str) {

    if ( this.debug == false ) { return; }
    console.log(str);
}

Table.prototype.editCell = function(id) {

    var self = this;
    var cell = $("td#"+id);

    if ( $(cell).find("input").length > 0 ) { 
        return false;
    }

    // Retrieve the cell data
    var val = $(cell).text() || "";
    var cellclass = $("td#"+id).attr("class");
    
    var dtype = this._gettype(id);
    var dt = this._datatypes(dtype);

    var cellAttr = {
        "type": "text",
        "class": "editcell",
        "placeholder": dt.placeholder,
        "value": val
    };

    var cellInput = $('<input />').attr(cellAttr);

    $(cell).addClass('has_input').empty().append(cellInput);

    $(cellInput).on("focus", function() {

            $(this).removeClass("error");
        }
    );

    $(cellInput).focus().select();
}

Table.prototype.formatCell = function(id) {

    var self = this;
    var cell = $("td#"+id);
    var val = $(cell).children("input").val();

    var dtype = this._gettype(id);
    var dt = this._datatypes(dtype);
    val = dt.format(val);

    self.log("format cell as: "+dtype+", original: "+ 
        $(cell).children("input").val() +", new: "+val);

    return val;
}

Table.prototype.saveCell = function(id) {

    var self = this;
    var cell = $("td#"+id);
    var val = self.formatCell(id)

    if ( val === false ) {

        $(cell).children("input").addClass("error");
        self.log("save cell: "+id+" failed - invalid format");
        
        return false;
    }
    else {

        $(cell).removeClass('has_input').empty().text(val);
        self.renderCalc();
    }
}

// Calculate formula based cells
Table.prototype.renderCalc = function() {

    var self = this;

    $("table"+this.id+" > tbody > tr > td.calc").each(function () {

        var cid = $(this).attr("id");
        var dtype = self._gettype(cid);
        var field = self._getfield(cid);

        if ( dtype == "calc" ) {
            var dt = self._datatypes(dtype);
            var fml = self.fields[field].formula || [];
            var val = dt.formula(cid, fml);
            $(this).empty().text(val);
        }
    });
}

Table.prototype.renderHead = function(fields) {

    if ( ! this._isvalid() ) { return false; }

    if ( $.isPlainObject(fields) && fields.length ) {
        this.fields = fields;
    }

    if ( this._has("fields") ) {

        // Truncate the existing data if it exists
        this.removeHead();

        // Re add header fields
        if ( ! $("table"+this.id).find("thead").length ) {
            $("table"+this.id).append('<thead />');
        }

        $("table"+this.id+" > thead").append('<tr></tr>');

        for (var key in this.fields) {
            this.log("Adding header: "+key);
            $("table"+this.id+" > thead > tr").append('<th>'+key+'</th>');
        }
    }
    else {
        this.log("Table fields Object is not defined");
        return false;
    }
}

Table.prototype.removeHead = function() {

    if ( ! this._isvalid() ) { return false; }

    // Truncate the existing header data if it exists
    $("table"+this.id+" > thead").empty();
}

Table.prototype.removeBody = function() {

    if ( ! this._isvalid() ) { return false; }

    // Truncate the existing body data if it exists
    $("table"+this.id+" > tbody").empty();   
}

Table.prototype.addRow = function(o) {

    var self = this;

    var o = o || {};
    var row = o.data || undefined;
    var dir = o.direction || self.direction;

    // Create the tbody if necessary
    if ( ! $("table"+this.id).find("tbody").length ) {
        $("table"+this.id).append('<tbody />');
    }

    // Convert object to an array
    if ( row === Object(row) ) {
        var rdata = [];
        for (var key in row) {
            rdata.push(row[key]);
        }
        row = rdata;
    }

    var r = this._count("rows");
    var rid = this._id()+'_'+r;
    var rowAttr = { "id": rid };

    // Add row based on direction
    switch(dir) {
        case "asc":
            // Ascending, append
            var rowEl = $('<tr />').attr(rowAttr);
            $("table"+this.id+" > tbody:last").append(rowEl);
            break;
        case "desc":
            // Descending, prepend
            var rowEl = $('<tr />').attr(rowAttr);
            $(rowEl).prependTo("table"+this.id+" > tbody:last");
            break;
    }

    // Populate the row with cells
    var c = 0;

    for (var key in this.fields) {

        var cid = rid+'_'+c;

        // Determine the data type
        var dtype = this.fields[key].type || "";
        var dt = this._datatypes(dtype);
        // Set the cell class
        var cellclass = this.fields[key]["class"] || "";
        cellclass += (dtype) ? " "+ dtype : "";

        // Set the default cell value
        var val = dt["default"] || "";
        // Set value from the provided data if any
        if ( $.isArray(row) && row.length >= (c-1) ) {
            val = row[c];
        }

        // Append the table cell to the row
        var cellAttr = {
            "id": cid,
            "class": cellclass
        };

        var cell = $("<td />").attr(cellAttr).text(val);
        $("table"+this.id+" > tbody:last > tr#"+rid).append(cell);

        // Increment the cell id
        c++;
    }
}

Table.prototype.delRow = function (id) {

    $("table"+this.id+" > tr#"+id).remove();

    return;
}

Table.prototype.render = function(direction) {

    var self = this;
    var dir = direction || self.direction;

    if ( ! this._isvalid() ) { return false; }

    // Drop the table if it exists
    this.drop();
    // Re add the header
    this.renderHead();

    // Add a row for each data set
    for (var i=0; i<this.data.length; i++) {

        this.addRow({ "data": this.data[i], "direction": dir });
    }

    // Calculate formula based cells
    this.renderCalc();
}

Table.prototype.drop = function() {

    if ( ! this._isvalid() ) { return false; }

    this.removeHead();
    this.removeBody();
}

Table.prototype.serialize = function(direction) {

    var self = this;
    var dir = direction || self.direction;

    var data = [];
    var rows;

    // Serialize data based on table data direction
    switch(dir) {
        case "asc":
            rows = $("table"+this.id+" > tbody > tr");
            break;
        case "desc":
            rows = $($("table"+this.id+" > tbody > tr").get().reverse());
            break;
    }

    $(rows).each(function () {

        var row = {};

        $(this).children("td").each(function () {

            var cid = $(this).attr("id");
            var field = self._getfield(cid);
            var val = $(this).text() || "";

            row[field] = val;
        });

        data.push(row);
    });

    return data;
}
