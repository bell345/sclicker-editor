var saveFile = null;
$(function () {
    // importing/exporting
    function importSaveFile(b64str) {
        try {
            var obj = JSON.parse(atob(b64str));
            saveFile = obj;
            processSaveFile();
        } catch (e) {
            throw new Error("The save file was not valid: "+e.message);
        }
    }

    function exportSaveFile() {
        if (saveFile != null) {
            try {
                processInputs();
                var b64str = btoa(JSON.stringify(saveFile));
                return b64str;
            } catch (e) {
                throw new Error("An error occured while exporting the file: "+e.message);
                return null;
            }
        } else return null;
    }

    $("#importer-submit").click(function () {
        var textarea = $("#importer-input")[0];
        importSaveFile(textarea.value);
    });

    // processing
    function processSaveFile() {
        var list = $("#fields");
        list.empty();
        list = list[0];

        if (saveFile != null) {
            var props = [];

            for (var prop in saveFile) if (saveFile.hasOwnProperty(prop)) {
                props.push(prop);
            }

            props.sort();

            for (var i=0;i<props.length;i++) {
                var prop = props[i];
                var str = propToString(prop);
                var val = saveFile[prop];
                console.log(str);

                var li = getNewListItem(prop, str, val);
                if (li != null) list.appendChild(li);
            }
        }
    }

    function processInputs() {
        var list = $("#fields li");
        if (list.length > 0) {
            for (var i=0;i<list.length;i++) {
                var item = $(list[i]);
                var input = item.find("input")[0];
                var field = input.getAttribute("data-field");
                var result = null;

                if (input.type == "checkbox") result = input.checked;
                else if (input.type == "number") result = parseFloat(input.value);
                else if (input.type == "text") result = input.value;

                if (field != null && result != null) saveFile[field] = result;
            }
        }
    }

    function getNewListItem(prop, str, val) {
        var id = "field-" + prop;
        var contId = id + "-container";

        var numberIsValid = false;
        var input = document.createElement("input");
        input.id = id;
        input.setAttribute("data-field", prop);

        var isBoolean = false;
        if (typeof val == "boolean") isBoolean = true;
        else if (prop.search("_chosen") != -1) isBoolean = true;
        else if (prop.search("show_") != -1) isBoolean = true;

        if (isBoolean) {
            input.type = "checkbox";
            input.checked = val == true;
        } else if (typeof val == "string") {
            input.type = "text";
            input.value = val;
        } else if (typeof val == "number") {
            input.type = "number";
            input.value = val;
        } else if (typeof val == "object") {
            console.log("Cannot edit object "+str+"; not implemented");
            return null;
        }

        var li = document.createElement("li");
        li.id = contId;
            var label = document.createElement("label");
            label.setAttribute("for", id);
            label.innerHTML = str;
        li.appendChild(label);
        li.appendChild(input);

        return li;
    }

    // utility
    function propToString(prop) {
        prop = prop.replace(/_/g, " ");
        prop = prop.replace(/(^| )cs( |$)/g, "$1CS$2");
        prop = prop.replace(/(^| )ai( |$)/g, "$1AI$2");
        prop = prop.replace(/(^| )tflops( |$)/g, "$1TFlops$2");

        var flag = true;
        var str = "";
        for (var i=0;i<prop.length;i++) {
            if (flag) str += prop[i].toUpperCase();
            else str += prop[i];

            flag = false;
            if (prop[i] == " ") flag = true;
        }

        return str;
    }

    function stringToProp(str) {
        str = str.replace(" ", "_");
        return str.toLowerCase();
    }

    function searchItems(search) {
        var items = $("#fields li");

        for (var i=0;i<items.length;i++) {
            var li = $(items[i]);
            var label = li.find("label");
            var humanReadable = label[0].innerHTML.toLowerCase();
            if (humanReadable.search(search) != -1) li.toggleClass("hide", false);
            else li.toggleClass("hide", true);
        }
    }

    $("#searcher").keydown(function () {
        searchItems(this.value);
    });

    $("#searcher-clear").click(function () {
        $("#searcher").val("");
        $("#fields li.hide").toggleClass("hide", false);
    });

    $("#exporter").click(function () {
        var exported = exportSaveFile();
        if (exported != null) {
            var output = $("#exporter-output")[0];
            output.value = exported;
            $("#exporter-container").slideDown();
        }
    });
    $("#exporter-return").click(function () {
        $("#exporter-container").slideUp();
    });
});
