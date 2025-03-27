function ajaxCall(type, url, data, successCB, errorCB) {
    $.ajax({
        type: type,
        url: url,
        data: data,
        contentType: "application/json",
        success: successCB,
        error: errorCB
    });
}
