function update_state( ) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
     if (xhttp.readyState == 4 && xhttp.status == 200) {
        var myRes = JSON.parse(xhttp.responseText);
        var exectime = myRes.exec_time;
        var myArr = myRes.table;
        update_func( exectime, myArr );
      }        
    };
    
    xhttp.open("GET", "/update", true );
    xhttp.send();
}
    

function get_icon( state ) {
  if (state == "pending" ) {
    retval = state;
  } else if ( state == "started" ) {
    retval = state;
  } else if ( state == "checking" ) {
    retval = state;
  } else if ( state == "pass" ) {
    retval = state;
  } else if ( state == "FAIL" ) {
    retval = "fail";
  } else if ( state == "complete" ) {
    retval = "completed";
  } else if ( state == "expected_failure") {
    retval = "expected_failure";
  } else {
    retval = "other";
  }
  
  return ("<img src=\"/"+retval+".png\" alt=\"[img]\">");
}


function mk_elem( tool, testid, delta_t) {
    
  retval = " <span class=\"nice_info\">"+tool+"/"+testid
  if (delta_t != "")  {
     retval = retval + " ["+delta_t+" sec]"
  }  
  retval = retval + "</span>";
  return retval;
    
}




function update_func( exec_time, arr ) {
    var ii;
    var num_run = 0;
    var num_chk = 0;
    var num_ok = 0;
    var num_bad = 0;
    var num_oth = 0;
    var num_pnd = 0;
    var num_complete =0;
    var num_expected = 0;

    var is_running = "";
    var is_checking = "";
    var is_failing = "";
    var is_other = "";
    var is_expected = "";

    for (ii=0; ii < arr.length; ii++) {
        var tool = arr[ii].tool;
        var tst = arr[ii].testid;
        var st = arr[ii].status;
        var dt_run = arr[ii].runtime;
        var dt_chk = arr[ii].chktime;


        var div_id = tool+"_"+tst;
        document.getElementById( div_id).innerHTML = "<a href=\"/diff/"+tool+"/"+tst+"\">"+get_icon(st)+"</a>";        

        if (st == 'started') { 
          num_run++; 
          is_running = is_running + mk_elem( tool, tst, dt_run );
        } else if (st == 'checking') {
          num_chk++;
          is_checking = is_checking + mk_elem( tool, tst, dt_chk );
        } else if (st == 'pass') {
          num_ok++;
        } else if (st == 'FAIL') {
          num_bad++;
          is_failing = is_failing + mk_elem( tool, tst, "" );
        } else if (st == 'pending') {
          num_pnd++;
        } else if (st == 'complete') {
          num_complete++;
        } else if (st == "expected_failure") {
          num_expected++;
          is_expected = is_expected + mk_elem(tool, tst, "");
        } else {
          num_oth++;
          is_other = is_other + mk_elem( tool, tst, "" );
        }
        
    }

  document.getElementById("num_running").innerHTML = num_run;
  document.getElementById("num_checking").innerHTML = num_chk;
  document.getElementById("num_passing").innerHTML = num_ok;
  document.getElementById("num_failing").innerHTML = num_bad;
  document.getElementById("num_expected").innerHTML = num_expected;
  document.getElementById("num_other").innerHTML = num_oth;
  document.getElementById("num_pending").innerHTML = num_pnd;
  document.getElementById("num_complete").innerHTML = num_complete;

  document.getElementById("is_running").innerHTML = is_running;
  document.getElementById("is_checking").innerHTML = is_checking;
  document.getElementById("is_failing").innerHTML = is_failing;
  document.getElementById("is_expected").innerHTML = is_expected;
  document.getElementById("is_other").innerHTML = is_other;

  if (( num_run + num_chk + num_pnd ) == 0 ) {
     clearInterval( update_it ); 
     document.getElementById("running_state").innerHTML = "Test completed in "+exec_time+" .";
  } else {
     document.getElementById("running_state").innerHTML = "Test running for "+exec_time+" . Page updates every 10 seconds."; 
  }

}
update_state();
var update_it = setInterval( update_state, 10000 ); // Every 10 seconds
