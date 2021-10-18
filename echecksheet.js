var table, myModal, deleteModal, deleteId, errorMessages = [];

var regex = /[0-2][0-9][:][0-5][0-9]/g;
var digitRegex = /\d+/g;

$(document).ready(function () {
	SessionNotValid();
    LoadData();
});

function LoadData() {
    $.ajax({
        type: "POST",
        url: "ECheckSheet.aspx/LoadSubmittedCheckSheetData",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
            userId: $("#txtSessionId").val()
        }),
        success: function (response) {
            var result = JSON.parse(response.d);
            table = $('#example').DataTable({
                dom: 'Bfrtip',
                data: result,
                columns: [
                    { data: "Date", sType: "date-uk" },
                    { data: "JobClassification" },
                    { data: "JobOrTask" },
                    { data: "Description" },
                    { data: "Remarks" },
                    { data: "StartTime" },
                    { data: "EndTime" },
                    { data: "TimeSpent" }
                ],
                select: {
                    style: 'single'
                },
                buttons: [
                    {
                        text: 'New',
                        action: function () {
							SessionNotValid();
                            AddCheckSheet();
                        }
                    },
                    {
                        text: 'Edit',
                        action: function (e, dt, node, config) {
							SessionNotValid();
                            /*
                            alert(
                                'Row data: ' +
                                JSON.stringify(dt.row({ selected: true }).data())
                            );
                            */
                            EditCheckSheet(JSON.stringify(dt.row({ selected: true }).data()));
                        }
                    },
                    {
                        text: 'Delete',
                        action: function (e, dt, node, config) {
							SessionNotValid();
                            //alert('Rows: ' + dt.rows({ selected: true }).count());
                            DeleteCheckSheet(JSON.stringify(dt.row({ selected: true }).data()));
                        }
                    }
                ],
                order: [[0, 'dec'], [5, 'asc']]
            });

            EnableAndDisableButtons();
        },
        failure: function (response) {
            alert(response.d);
        }
    })
};

jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "date-uk-pre": function (a) {
        var ukDatea = a.split('/');
        return (ukDatea[2] + ukDatea[1] + ukDatea[0]) * 1;
    },

    "date-uk-asc": function (a, b) {
        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    },

    "date-uk-desc": function (a, b) {
        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
    }
});

function EnableAndDisableButtons() {
    table.buttons(1).enable(false);
    table.buttons(2).enable(false);

    table.on('select', function () {
        var selectedRows = table.rows({ selected: true }).count();

        table.button(1).enable(selectedRows === 1);
        table.button(2).enable(selectedRows === 1);
    });
    table.on('deselect', function () {
        var selectedRows = table.rows({ selected: true }).count();

        table.button(1).enable(selectedRows === 1);
        table.button(2).enable(selectedRows === 1);
    });
};

function AddCheckSheet() {
    ClearErrorMessages();
    DeselectAllOptions();
    $("#txtId").val("");
	var currentTime = new Date();
    $("#txtDate").val(currentTime.toLocaleDateString("en-UK"));
    $("#txtDate").trigger("change");
    $('#selectJobClassification option[value="0"]').attr("selected", "selected");
    $('#selectJobOrTask option[value="0"]').attr("selected", "selected");
    $("#txtDescription").val("");
    $("#txtRemarks").val("");
    $("#txtStartTime").val("");
    $("#txtEndTime").val("");
    $("#txtManualTimeInput").val("");
    RefreshSelect();
    TriggerSelectChange();
    myModal = new bootstrap.Modal(document.getElementById('checkSheetModal'), { backdrop: 'static' });
    myModal.show(myModal);
};

function EditCheckSheet(obj) {
    // console.log($(".dt-button").closest("button").find('span').eq(1).text());
    ClearErrorMessages();
    DeselectAllOptions();
    var checkSheetObject = JSON.parse(obj);
    if (checkSheetObject.ManualTimeInput != 0) {
        $("#checkBoxManualTimeInput").prop("checked", true);
    }
    else {
        $("#checkBoxManualTimeInput").prop("checked", false);
    }
    $("#checkBoxManualTimeInput").trigger("change");
    $("#txtId").val(checkSheetObject.Id);
    $("#txtDate").val(checkSheetObject.Date);
    // $("#txtDate").trigger("change");
    $(`#selectJobClassification option[value="${checkSheetObject.JobClassification}"]`).attr("selected", "selected");
    $(`#selectJobOrTask option[value="${checkSheetObject.JobOrTask}"]`).attr("selected", "selected");
    $("#txtDescription").val(checkSheetObject.Description);
    $("#txtRemarks").val(checkSheetObject.Remarks);
    $("#txtStartTime").val(checkSheetObject.StartTime);
    $("#txtEndTime").val(checkSheetObject.EndTime);
    $("#txtManualTimeInput").val(checkSheetObject.ManualTimeInput);
    RefreshSelect();
    TriggerSelectChange();
    myModal = new bootstrap.Modal(document.getElementById('checkSheetModal'), { backdrop: 'static' });
    myModal.toggle(myModal);
    // $('#selectJobOrTask').prop("disabled", false);
};

function DeleteCheckSheet(obj) {
    var checkSheetObject = JSON.parse(obj);
    deleteId = checkSheetObject.Id;
    deleteModal = new bootstrap.Modal(document.getElementById('deleteCheckSheetModal'), { backdrop: 'static' });
    deleteModal.toggle(deleteModal);
}

$('select[name="selectJobOrTask"]').change(function () {
    if ($(this).val() == "Others") {
        $('input[name="txtJobOrTask"]').prop('disabled', false);
    } else { $('input[name="txtJobOrTask"]').prop('disabled', true); }
});

/*
$('select[name="selectDescription"]').change(function () {
    if ($(this).val() == "Others") {
        $('input[name="txtDescription"]').prop('disabled', false);
    } else { $('input[name="txtDescription"]').prop('disabled', true); }
});
*/

$(function () {
    $(".timepicker").timepicker();
    $(".datepicker").datepicker({ dateFormat: 'dd/mm/yy' });
});

$("#btnSubmit").on("click", function (e) {
    e.preventDefault(); // prevent de default action, which is to submit
    // save your value where you want
    // data.select = $("#exampleSelect").value();
    // or call the save function here
    // save();
    // $(this).prev().click();
    if ($("#txtId").val() == "") {
        AddCheckSheetToDatabase();
    }
    else {
        EditCheckSheetInDatabase();
    }
});

$("#btnDelete").on("click", function (e) {
    e.preventDefault(); // prevent de default action, which is to submit
    DeleteCheckSheetInDatabase(deleteId);
});

function TriggerSelectChange() {
    $("#selectJobClassification").trigger('change');
    $("#selectJobOrTask").trigger('change');
    // $("#selectDescription").trigger('change');
};

function DeselectAllOptions() {
    $("option:selected").removeAttr("selected");
};

function RefreshSelect() {
    $('#selectJobClassification').trigger("chosen:updated");
    $('#selectJobOrTask').trigger("chosen:updated");
    // $('#selectDescription').trigger("chosen:updated");
};

function AddCheckSheetToDatabase() {
    ValidateAllFields();
    if ($("#txtDate").hasClass("is-valid") &&
        $("#selectJobClassification").hasClass("is-valid") &&
        $("#selectJobOrTask").hasClass("is-valid") && !$("#txtJobOrTask").hasClass("is-invalid") &&
        $("#txtDescription").hasClass("is-valid") &&
        ($("#txtStartTime").hasClass("is-valid") && $("#txtEndTime").hasClass("is-valid") && $("#txtManualTimeInput").prop("disabled") ||
            $("#txtStartTime").prop("disabled") && $("#txtEndTime").prop("disabled") && $("#txtManualTimeInput").hasClass("is-valid"))) {
        var jobOrTask;
        if ($("#selectJobOrTask").val() == "Others") {
            jobOrTask = $("#txtJobOrTask").val();
        }
        else {
            jobOrTask = $("#selectJobOrTask").val();
        }
        /*
        if ($("#selectDescription").val() == "Others") {
            description = $("#txtDescription").val();
        }
        else {
            description = $("#selectDescription").val();
        }
        */

        $.ajax({
            type: "POST",
            url: "ECheckSheet.aspx/PostAddData",
            data: JSON.stringify({
                userId: $("#txtSessionId").val(),
                submitDate: $("#txtDate").val(),
                jobClassification: $("#selectJobClassification").val(),
                jobOrTask: jobOrTask,
                description: $("#txtDescription").val(),
                remarks: $("#txtRemarks").val(),
                startTime: $('#txtStartTime').prop("disabled") ? null : $("#txtStartTime").val(),
                endTime: $('#txtEndTime').prop("disabled") ? null : $("#txtEndTime").val(),
                manualTimeInput: $("#txtManualTimeInput").val() === "" || $("#txtManualTimeInput").prop("disabled") ? 0 : $("#txtManualTimeInput").val()
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                // alert(response.d);
                myModal.hide();
                window.location.reload();
            },
            failure: function (response) {
                alert(response.d);
            }
        });
    }
    
};

function EditCheckSheetInDatabase() {
    ValidateAllFields();
    if ($("#txtDate").hasClass("is-valid") &&
        $("#selectJobClassification").hasClass("is-valid") &&
        $("#selectJobOrTask").hasClass("is-valid") && !$("#txtJobOrTask").hasClass("is-invalid") &&
        $("#txtDescription").hasClass("is-valid") &&
        ($("#txtStartTime").hasClass("is-valid") && $("#txtEndTime").hasClass("is-valid") && $("#txtManualTimeInput").prop("disabled") ||
        $("#txtStartTime").prop("disabled") && $("#txtEndTime").prop("disabled") && $("#txtManualTimeInput").hasClass("is-valid"))) {
        var jobOrTask;
        if ($("#selectJobOrTask").val() == "Others") {
            jobOrTask = $("#txtJobOrTask").val();
        }
        else {
            jobOrTask = $("#selectJobOrTask").val();
        }
        /*
        if ($("#selectDescription").val() == "Others") {
            description = $("#txtDescription").val();
        }
        else {
            description = $("#selectDescription").val();
        }
        */

        $.ajax({
            type: "POST",
            url: "ECheckSheet.aspx/PostEditData",
            data: JSON.stringify({
                userId: $("#txtSessionId").val(),
                id: $("#txtId").val(),
                submitDate: $("#txtDate").val(),
                jobClassification: $("#selectJobClassification").val(),
                jobOrTask: jobOrTask,
                description: $("#txtDescription").val(),
                remarks: $("#txtRemarks").val(),
                startTime: $('#txtStartTime').prop("disabled") ? null : $("#txtStartTime").val(),
                endTime: $('#txtEndTime').prop("disabled") ? null : $("#txtEndTime").val(),
                manualTimeInput: $("#txtManualTimeInput").val() === "" || $('#txtManualTimeInput').prop("disabled") ? 0 : $("#txtManualTimeInput").val()
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                // alert(response.d);
                myModal.hide();
                window.location.reload();
            },
            failure: function (response) {
                alert(response.d);
            }
        });
    }
};

function DeleteCheckSheetInDatabase(id) {
    $.ajax({
        type: "POST",
        url: "ECheckSheet.aspx/DeleteData",
        data: JSON.stringify({
            id: id
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            // alert(response.d);
            deleteModal.hide();
            window.location.reload();
        },
        failure: function (response) {
            alert(response.d);
        }
    });
};

function ValidateAllFields() {
    ClearErrorMessages();
	var currentTime = new Date();
    if ($("#txtDate").val() == "") {
        $("#txtDate").removeClass("is-valid");
        $("#txtDate").addClass("is-invalid");
        errorMessages.push("Please select a valid date.");
    }
    else {
        $("#txtDate").removeClass("is-invalid");
        $("#txtDate").addClass("is-valid");
        errorMessages.slice("Please select a valid date.");
    }

    if ($("#selectJobClassification").val() === "0") {
        $("#selectJobClassification").removeClass("is-valid");
        $("#selectJobClassification").addClass("is-invalid");
        errorMessages.push("Please select a valid job classification.");
    }
    else {
        $("#selectJobClassification").removeClass("is-invalid");
        $("#selectJobClassification").addClass("is-valid");
        errorMessages.slice("Please select a valid job classification.");
    }

    if ($("#selectJobOrTask").val() === "0") {
        $("#selectJobOrTask").removeClass("is-valid");
        $("#selectJobOrTask").addClass("is-invalid");
        errorMessages.push("Invalid Job / Task. Please select Job / Task you have inputed in OA WFH Form or choose Others.");
    }
    else if ($("#selectJobOrTask").val() == "Others" && $("#txtJobOrTask").val() == "") {
        $("#txtJobOrTask").removeClass("is-valid");
        $("#txtJobOrTask").addClass("is-invalid");
        errorMessages.push("Invalid Job / Task. Please select Job / Task you have inputed in OA WFH Form or choose Others.");
    }
    else {
        $("#selectJobOrTask").removeClass("is-invalid");
        $("#selectJobOrTask").addClass("is-valid");
        $("#txtJobOrTask").removeClass("is-invalid");
        $("#txtJobOrTask").addClass("is-valid");
        errorMessages.slice("Invalid Job / Task. Please select Job / Task you have inputed in OA WFH Form or choose Others.");
    }

    if ($("#txtDescription").val() == "") {
        $("#txtDescription").removeClass("is-valid");
        $("#txtDescription").addClass("is-invalid");
        errorMessages.push("Please input a valid description.");
    }
    else {
        $("#txtDescription").removeClass("is-invalid");
        $("#txtDescription").addClass("is-valid");
        errorMessages.slice("Please input a valid description.");
    }

    if ($("#txtManualTimeInput").prop("disabled")) {
        if ($("#txtStartTime").val() == "" || $("#txtStartTime").val().match(regex) == null || $("#txtStartTime").val() >= $("#txtEndTime").val() || $("#txtStartTime").val() < "06:00") {
            $("#txtStartTime").removeClass("is-valid");
            $("#txtStartTime").addClass("is-invalid");
            errorMessages.push("Please input a valid start time.");
        }
        else {
            $("#txtStartTime").removeClass("is-invalid");
            $("#txtStartTime").addClass("is-valid");
            errorMessages.slice("Please input a valid start time.");
        }

        if ($("#txtEndTime").val() == "" || $("#txtEndTime").val() > currentTime.getHours() + ":" + currentTime.getMinutes() || $("#txtEndTime").val().match(regex) == null) {
            $("#txtEndTime").removeClass("is-valid");
            $("#txtEndTime").addClass("is-invalid");
            errorMessages.push("Please input a valid end time. It must be less than current time.");
        }
        else {
            $("#txtEndTime").removeClass("is-invalid");
            $("#txtEndTime").addClass("is-valid");
            errorMessages.slice("Please input a valid end time. It must be less than current time.");
        }
    }
    else {
        if ($("#txtManualTimeInput").val().match(digitRegex) == null) {
            $("#txtManualTimeInput").removeClass("is-valid");
            $("#txtManualTimeInput").addClass("is-invalid");
            errorMessages.push("Please input a valid duration. It must be in minutes.");
        }
        else {
            $("#txtManualTimeInput").removeClass("is-invalid");
            $("#txtManualTimeInput").addClass("is-valid");
            errorMessages.slice("Please input a valid duration. It must be in minutes.");
        }
    }

    /*
    if ($("#txtManualTimeInput").val() == "" && $("#txtStartTime").val() == "" && $("#textEndTime").val() == "") {
        $("#txtStartTime").removeClass("is-valid");
        $("#txtStartTime").addClass("is-invalid");
        $("#txtEndTime").removeClass("is-valid");
        $("#txtEndTime").addClass("is-invalid");
        $("#txtManualTimeInput").removeClass("is-valid");
        $("#txtManualTimeInput").addClass("is-invalid");
        errorMessages.push("You need to input either start time and end time or duration.");
    }
    else {
        $("#txtStartTime").removeClass("is-invalid");
        $("#txtStartTime").addClass("is-valid");
        $("#txtEndTime").removeClass("is-invalid");
        $("#txtEndTime").addClass("is-valid");
        $("#txtManualTimeInput").removeClass("is-invalid");
        $("#txtManualTimeInput").addClass("is-valid");
        errorMessages.slice("You need to input either start time and end time or duration.");
    }
    */

    if (errorMessages.length > 0) {
        var errorHTML = "<ol>";

        errorMessages.forEach(function (entry) {
            errorHTML += "<li>" + entry + "</li>";
        });

        errorHTML += "</ol>";

        $("#displayAllErrors").append(errorHTML);
    }
    else {
        ClearErrorMessages();
    }   
};

function ClearErrorMessages() {
    errorMessages = [];
    $("#displayAllErrors").empty();
};

$("#txtDate").on('change', function (e) {
    e.preventDefault(); // prevent de default action, which is to submit
    if ($("#txtDate").val() == "") {
        // $("#selectJobOrTask").prop("disabled", true);
        $("#txtDate").removeClass("is-valid");
        $("#txtDate").addClass("is-invalid");
    }
    else {
        // $("#selectJobOrTask").prop("disabled", false);
        $("#txtDate").removeClass("is-invalid");
        $("#txtDate").addClass("is-valid");
        // LoadJobOrTask();
    }
});

$("#selectJobClassification").on('input', function (e) {
    e.preventDefault(); // prevent de default action, which is to submit
    console.log($("#selectJobOrTask").html());
    if ($("#selectJobClassification").val() === "0") {
        $("#selectJobClassification").removeClass("is-valid");
        $("#selectJobClassification").addClass("is-invalid");
    }
    else {
        $("#selectJobClassification").removeClass("is-invalid");
        $("#selectJobClassification").addClass("is-valid");
    }
});

$("#selectJobOrTask").on('input', function (e) {
    e.preventDefault(); // prevent de default action, which is to submit
    if ($("#selectJobOrTask").val() == "0") {
        $("#selectJobOrTask").removeClass("is-valid");
        $("#selectJobOrTask").addClass("is-invalid");
    }
    else {
        $("#selectJobOrTask").removeClass("is-invalid");
        $("#selectJobOrTask").addClass("is-valid");
    }
});

$("#txtJobOrTask").on('input', function (e) {
    e.preventDefault(); // prevent de default action, which is to submit
    if ($("#txtJobOrTask").val() == "") {
        $("#txtJobOrTask").removeClass("is-valid");
        $("#txtJobOrTask").addClass("is-invalid");
    }
    else {
        $("#txtJobOrTask").removeClass("is-invalid");
        $("#txtJobOrTask").addClass("is-valid");
    }
});

$("#txtDescription").on('input', function (e) {
    e.preventDefault(); // prevent de default action, which is to submit
    if ($("#txtDescription").val() == "") {
        $("#txtDescription").removeClass("is-valid");
        $("#txtDescription").addClass("is-invalid");
    }
    else {
        $("#txtDescription").removeClass("is-invalid");
        $("#txtDescription").addClass("is-valid");
    }
});

$("#txtStartTime").on('input', function (e) {
    e.preventDefault(); // prevent de default action, which is to submit
    if ($("#txtStartTime").val() == "" || $("#txtStartTime").val().match(regex) == null || $("#txtStartTime").val() < "06:00") {
        $("#txtStartTime").removeClass("is-valid");
        $("#txtStartTime").addClass("is-invalid");
    }
    else {
        $("#txtStartTime").removeClass("is-invalid");
        $("#txtStartTime").addClass("is-valid");
    }
});

$("#txtEndTime").on('input', function (e) {
    e.preventDefault(); // prevent de default action, which is to submit
	var currentTime = new Date();
    if ($("#txtEndTime").val() == "" || ($("#txtEndTime").val() > currentTime.getHours() + ":" + currentTime.getMinutes() || $("#txtEndTime").val().match(regex) == null)) {
        $("#txtEndTime").removeClass("is-valid");
        $("#txtEndTime").addClass("is-invalid");
    }
    else {
        $("#txtEndTime").removeClass("is-invalid");
        $("#txtEndTime").addClass("is-valid");
    }
});

$("#txtManualTimeInput").on('input', function (e) {
    e.preventDefault(); // prevent de default action, which is to submit
    if ($("#txtManualTimeInput").val() == "" || $("#txtManualTimeInput").val().match(digitRegex) == null) {
        $("#txtManualTimeInput").removeClass("is-valid");
        $("#txtManualTimeInput").addClass("is-invalid");
    }
    else {
        $("#txtManualTimeInput").removeClass("is-invalid");
        $("#txtManualTimeInput").addClass("is-valid");
    }
});

$("#checkBoxManualTimeInput").on('change', function (e) {
    e.preventDefault(); // prevent de default action, which is to submit
    EnableOrDisableTimeRelatedInput(this.checked);
});

function EnableOrDisableTimeRelatedInput(check) {
    $("#txtStartTime").prop("disabled", check);
    $("#txtEndTime").prop("disabled", check);
    $("#txtManualTimeInput").prop("disabled", !check);

    if (check) {
        $("#txtStartTime").val("");
        $("#txtEndTime").val("");
    }
    else {
        $("#txtManualTimeInput").val("");
    }
}

function SessionNotValid() {
    if ($("#txtSessionId").val() == "" || $("#txtSessionId").val() == null) {
        location.href = "Logout.aspx";
    }
}
