/* globals nv, d3, thothApi, chartsData, realtime, graphBuilder */
/* exported thoth */

var formParams = [];

/**
 * Show right form and data box while hiding the other forms/data boxes
 */
function showFormAndData(objectId){
  ['servers', 'pools', 'realtime', 'slowqueries', 'exceptions'].forEach(function(data){
    if (objectId === data) {
      $('#' + data).show();
    } else {
      $('#' + data).hide();
    }
  });
}

/**
 * Return a qtime in mseconds or seconds depending on the quantity
 * in: qtime in ms
 */
function formatQtime(qtime){
  if (qtime > 1000) {
    // more than 1 sec, return secs
    return (qtime / 1000) + ' s';
  } else {
    // less than 1 sec, return ms
    return qtime + ' ms';
  }
}

/**
 * Set default dates in the forms. From : Yesterday , To: Tomorrow
 */
function setDefaultFromAndToDates(){
  var today = new Date(); var yesterday = new Date();
  // Set yesterday date
  yesterday.setDate(yesterday.getDate() - 1);
  // Set both yesterday and today dates in the right string format
  var todayStr = today.getFullYear() + '/' + ('00'+ (today.getMonth()+1)).slice(-2) + '/' + ('00'+ (today.getDate()+1)).slice(-2) + ' ' + '12:00:00';
  var yesterdayStr = yesterday.getFullYear() + '/' + ('00'+ (yesterday.getMonth()+1)).slice(-2) + '/' + ('00'+ yesterday.getDate()).slice(-2) + ' ' + '12:00:00';
  // Add date values if they are not already filled in the form
  if (getParamValue('from') == null)  $('[data-role=from_date_input]').val(yesterdayStr);
  else $('[data-role=from_date_input]').val(getParamValue('from'));

  if (getParamValue('to') == null)  $('[data-role=to_date_input]').val(todayStr);
  else  $('[data-role=to_date_input]').val(getParamValue('to'));
}

/**
 * API calls grouped by board
 */

var thoth = {
  servers: function () {
    showFormAndData('servers');

    var self = this;

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'avg', endpoint: 'qtime'})), function (data) {
      self._lineGraph(chartsData.query_time.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'avg', endpoint: 'nqueries'})), function (data) {
      self._lineGraph(chartsData.query_count.options, data);
    });
    $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'avg', endpoint: 'queriesOnDeck'})), function (data) {
      self._lineGraph(chartsData.query_on_deck.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'count', endpoint: 'exception'})), function (data) {
      self._lineGraph(chartsData.exception_count.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'integral', endpoint: 'exception'})), function (data) {
      self._lineGraph(chartsData.exception_integral.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'integral', endpoint: 'nqueries'})), function (data) {
      self._lineGraph(chartsData.query_integral.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'count', endpoint: 'zeroHits'})), function (data) {
      self._lineGraph(chartsData.zeroHits_count.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'integral', endpoint: 'zeroHits'})), function (data) {
      self._lineGraph(chartsData.zeroHits_integral.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'distribution', endpoint: 'qtime'})), function (data) {
      self._stackedLineGraph(chartsData.query_distribution.options, data);
    });

  },

  pools: function () {
    showFormAndData('pools');
    var self = this;

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'pool', attribute: 'avg', endpoint: 'qtime'})), function (data) {
      self._cumulativeLineGraph(chartsData.pool_query_time.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'pool', attribute: 'avg', endpoint: 'nqueries'})), function (data) {
      self._cumulativeLineGraph(chartsData.pool_query_count.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'pool', attribute: 'avg', endpoint: 'queriesOnDeck'})), function (data) {
      self._cumulativeLineGraph(chartsData.pool_query_on_deck.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'pool', attribute: 'count', endpoint: 'exception'})), function (data) {
      self._cumulativeLineGraph(chartsData.pool_exception_count.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'pool', attribute: 'integral', endpoint: 'exception'})), function (data) {
      self._cumulativeLineGraph(chartsData.pool_exception_integral.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'pool', attribute: 'integral', endpoint: 'nqueries'})), function (data) {
      self._cumulativeLineGraph(chartsData.pool_query_integral.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'pool', attribute: 'count', endpoint: 'zeroHits'})), function (data) {
      self._cumulativeLineGraph(chartsData.pool_zeroHits_count.options, data);
    });

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'pool', attribute: 'integral', endpoint: 'zeroHits'})), function (data) {
      self._cumulativeLineGraph(chartsData.pool_zeroHits_integral.options, data);
    });
  },

  slowqueries: function (npage) {
    showFormAndData('slowqueries');
    var self = this;
    var $paginationDemo = $('[data-role=slowqueries_pagination_demo]'),
      $paginationWrapper = $('[data-role=slowqueries_pagination_wrapper]');

    if(npage == undefined) {
      npage = 1;
    }

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'list', endpoint: 'slowqueries', page: npage})), function (data) {
      //TODO handle negative case
      var pages = Math.round(data.numFound / 12) - 1;

      $paginationDemo.remove();
      $paginationWrapper.append('<ul data-role="slowqueries_pagination_demo" class="pagination-sm pagination-demo"></ul>');
      $paginationDemo.twbsPagination({
        totalPages: pages,
        visiblePages: 7,
        onPageClick: function (event, page) {
          $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'list', endpoint: 'slowqueries', page: page})), function (data) {
            self._fill_slowQuery(page, data);
          });
        }
      });
    });
  },

  exceptions: function (npage) {
    showFormAndData('exceptions');
    var self = this;
    var $paginationDemo = $('[data-role=exceptions_pagination_demo]'),
      $paginationWrapper = $('[data-role=exceptions_pagination_wrapper]');

    if(npage == undefined) {
      npage = 1;
    }

    $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'list', endpoint: 'exception', page: npage})), function (data) {
      //TODO handle negative case
      var pages = Math.round(data.numFound / 12) - 1;

      $paginationDemo.remove();
      $paginationWrapper.append('<ul data-role="exceptions_pagination_demo" class="pagination-sm pagination-demo"></ul>');
      $paginationDemo.twbsPagination({
        totalPages: pages,
        visiblePages: 7,
        onPageClick: function (event, page) {
          $.getJSON(thothApi.getUri(self._getParams({objectId: 'server', attribute: 'list', endpoint: 'exception', page: page})), function (data) {
            self._fill_exceptions(page, data);
          });
        }
      });
    });
  },

  realtime: function () {
    realtime.show();
  },

  _fill_slowQuery: function(page, data){

    var $content = $('[data-role=slowqueries_content]'),
      $pageContent = $('[data-role=slowqueries_page_content]');

    // Remove previous slow query boxes
    $content.remove();
    // Create the container for the new boxes
    $pageContent.append('<div data-role="slowqueries_content"></div>');

    for (var i=0; i < data.values.length; i++){
      var el = data.values[i];
      var plainDate = new Date(el.timestamp);
      // Month/Day/Year Time/am-pm
      var formattedDate = plainDate.getMonth() + "/" + plainDate.getDate() + "/" + plainDate.getFullYear() + " " + plainDate.getHours() + ":" + plainDate.getMinutes() + ":" + plainDate.getSeconds();
      $('[data-role=slowqueries_content]').append('<div id="slowquery-box-' + i + '" class="slowquery-box col-md-3"><div class="timestamp slowquery">'
        + formattedDate +'</div><a><i class="entypo eye" onClick="showListLightBox(this);"></i></a><div class="qtime">'
        + formatQtime(el.qtime) + '</div><div class="query"> <label>Query</label><p class="query-text">'
        + el.query + '</p></div></div>');
    }
  },

  _fill_exceptions: function(page, data){

    var $content = $('[data-role=exceptions_content]'),
      $pageContent = $('[data-role=exceptions_page_content]');
    // Remove previous slow query boxes
    $content.remove();
    // Create the container for the new boxes
    $pageContent.append('<div data-role="exceptions_content"></div>');

    for (var i=0; i < data.values.length; i++){
      var el = data.values[i];
      var plainDate = new Date(el.timestamp);
      // Month/Day/Year Time/am-pm
      var formattedDate = plainDate.getMonth() + "/" + plainDate.getDate() + "/" + plainDate.getFullYear() + " " + plainDate.getHours() + ":" + plainDate.getMinutes() + ":" + plainDate.getSeconds();
      var exceptionName = el.exception.substr(0, el.exception.indexOf(' '));
      $('[data-role=exceptions_content]').append('<div id="slowquery-box-'+i+'" class="slowquery-box col-md-3"><div class="timestamp exception">'
        + formattedDate + '</div><a><i class="entypo eye" onClick="showListLightBox(this);"></i></a><div class="exceptionName truncate">' + exceptionName + '</div><div class="query-exception"><label>StackTrace</label><p class="query-text">'
        + el.exception + '</div><div class="query"> <label>Query</label><p class="query-text">' 
        + el.query + '</p></div></div>');
    } 
  },

  _getParams: function (options) {
    //TODO: not run this every time we need params for graphs
    var paramsList = {};
    //Add dates
    paramsList['from_date'] = new Date(Date.parse($('[data-role=from_date_input]').val())).toISOString();
    paramsList['to_date']   = new Date(Date.parse($('[data-role=to_date_input]').val())).toISOString();
    //Add values of selects visible for this view
    var $formElements = $('#params select');
    $.each($formElements, function(){
      if ($(this).is(':visible')){
        paramsList[$(this).prev().text().replace(/ /g,'').toLowerCase()] = ($(this).val());
      }
    });
    return $.extend(paramsList, options);
  },

  _lineGraph: function (params, data) {
    return graphBuilder.lineGraph(params, data);
  },

  /**
   * ## Cumulative Line Graph
   *
   * Showing pool data with multiple line graph
   *
   * @param params
   * @param data
   * @private
   */
  _cumulativeLineGraph: function (params, data) {

    nv.addGraph(function() {
      var chart = nv.models.cumulativeLineChart()
          .x(function(d) { return Date.parse(d[0]) })
          .y(function(d) { return d[1] }) //adjusting, 100% is 1.00, not 100 as it is in the data
          .color(d3.scale.category10().range())
          .useInteractiveGuideline(true)
        ;
      //chartsData[params.chartId].options.color = d3.scale.category10().range();
      chart.xAxis
        .tickValues([1078030800000,1122782400000,1167541200000,1251691200000])
        .tickFormat(function(d) {
          return d3.time.format('%x')(new Date(d))
        });

      // Formatting values to be represented with 3 figures and a symbol
      chart.yAxis
        .tickFormat(function(d) {
          return d + d3.formatPrefix(d).symbol();
        })
        .tickFormat(d3.format('.3s'));

      // Populate values for lightbox display
      data.forEach(function(obj) {
        var v = [];
        obj.values.forEach(function (val) {
          v.push({
            // set x to date, y to value
            x: Date.parse(val[0]), y: val[1]
          });
        });
        chartsData[params.chartId].values.push({key: obj.key, values: v});
      });

      d3.select('#' + params.chartId + ' svg')
        .datum(data)
        .call(chart);

      //TODO: Figure out a good way to do this automatically
      nv.utils.windowResize(chart.update);

      return chart;
    });
  },

  _stackedLineGraph: function (params, data) {
    return graphBuilder.stackedAreaChart(params, data);
  }
};

// Listen for document click to close non-modal dialog
$(document).mousedown(function (e) {
  var clicked = $(e.target); // get the element clicked
  if (clicked.is('#lightbox') || clicked.is('.close-button')) {
    $('#lightbox').hide(); //or .fadeOut();
  }
  if (clicked.is('#listLightbox')) {
    $('#listLightbox').hide(); //or .fadeOut();
  }
});

/**
 * Retrieve the params from query string
 * @return array of params, empty array if landing page
 */
function getParamsFromQueryString(){
  var params = location.href.split('?')[1];
  var formParams = [];

  if (params != undefined) {  // not landing page
    var splittedParam = params.split('&');
    splittedParam[0] = splittedParam[0].replace('/', ''); // Remove the '/' from the page value
    splittedParam.forEach(function(e){
      var val = decodeURIComponent(e.split("=")[1]).replace(/"/g,'');
      if (val[val.length-1] == '/') val = val.substr(0, val.length-2); // Remove the '/' from the last param value
      formParams.push({ name: e.split("=")[0], value: val}); // Store param and value in formParams array
    });
  }
  return formParams;
}

/**
 * Return value from param stored in the formParams array
 * @param  paramName name
 * @return value or null if param does not exist
 */
function getParamValue(paramName){
  for(var i=0; i < formParams.length; i++){
    if (formParams[i].name == paramName) return formParams[i].value;
  }
  return null;
}



/**
 * Initialize jquery datetime pickers and set default dates value
 */
function initializeDatetimePickers(){
  $('[data-role=from_date_input], [data-role=to_date_input]').datetimepicker({
    format: 'Y/m/d h:i:s'
  });
  setDefaultFromAndToDates();
}

/**
 * Retrieve selected option from dropdown select
 * @param paramId id
 * @return value
 */
function getSelectedParamValue(paramId){
  return $('#' + paramId + ' option:selected').val();
}

/**
 * Generate a new query string from the form and returns it
 * @return query string
 */
function updateQueryStringFromForm(){

  var $formParams           = $('form select');
  var poolParamIsVisible   = $($formParams[1]).is(':visible');

  var isServerPage      = getParamValue('p') === 'servers';
  var isSlowqueriesPage = getParamValue('p') === 'slowqueries';
  var isExceptionsPage  = getParamValue('p') === 'exceptions';
  var isRealTime        = getParamValue('p') === 'realtime';


  var queryString = '?';
  if (isServerPage) queryString += 'p=servers&server=' + '"' + getSelectedParamValue($formParams[0].id) + '"';
  if (poolParamIsVisible) queryString += 'p=pools&pool=' + '"' + getSelectedParamValue($formParams[1].id) + '"';
  if (isSlowqueriesPage) queryString += 'p=slowqueries&server=' + '"' + getSelectedParamValue($formParams[0].id) + '"';
  if (isExceptionsPage) queryString += 'p=exceptions&server=' + '"' + getSelectedParamValue($formParams[0].id) + '"';
  if (isRealTime) queryString += 'p=realtime&server=' + '"' + getSelectedParamValue($formParams[0].id) + '"';
  queryString += '&port=' + '"' + getSelectedParamValue($formParams[2].id) + '"';
  queryString += '&core=' + '"' + getSelectedParamValue($formParams[3].id) + '"' ;
  queryString += '&from=' + '"' + $('[data-role=from_date_input]').val().replace(/ /g,'%20') + '"';
  queryString += '&to=' + '"' + $('[data-role=to_date_input]').val().replace(/ /g,'%20') + '"';
  return queryString;
}


function hideFormFields(){
  var elements = [$('[data-role=to_date_input]'), $('[data-role=from_date_input]'), $('[for=from_date]'), $('[for=to_date]'), $('[data-role=share_url]'), $('[data-role=submit_settings]')];
  elements.forEach(function(el){
    $(el).hide();
  });
}

function showFormFields(){
  var elements = [$('[data-role=to_date_input]'), $('[data-role=from_date_input]'), $('[for=from_date]'), $('[for=to_date]'), $('[data-role=share_url]'), $('[data-role=submit_settings]')];
  elements.forEach(function(el){
    $(el).show();
  });
}

/**
 * Change class for left menu link if page is selected
 */
function activateMenuLink(){

  var $li = $('#menu li');
  $li.removeClass('active');
  if (getParamValue('p') != null) {
    // populateForm(getParamValue('p'));
    var index;
    if ('servers' === getParamValue('p')) index = 0;
    if ('pools' === getParamValue('p')) index = 1;
    if ('exceptions' === getParamValue('p')) index = 2;
    if ('slowqueries' === getParamValue('p')) index = 3;
    if ('realtime' === getParamValue('p')) index = 4;

    $($li[index]).addClass('active');
  }
}


// APPLICATION START
$('document').ready(function () {

  // Bind events to the button
  $('[data-role=submit_settings]').on('click', function (event) {
    event.preventDefault();
    document.location =  updateQueryStringFromForm();
  });

  $('[data-role=share_url]').on('click', function (event) {
    event.preventDefault();
    alert("Share this URL: \n\n" + document.location.href);
  });

  formParams = getParamsFromQueryString();
  initializeDatetimePickers();
  if (getParamValue('p') === null) {
    hideFormFields();
  } else {
    if (getParamValue('p') === 'realtime') {
      if (realtime.socket) {
        realtime._sendNewData();
      }
    }
    showFormFields();
    populateForm(getParamValue('p'));
  }
  showFormAndData(getParamValue('p'));
  activateMenuLink();
});