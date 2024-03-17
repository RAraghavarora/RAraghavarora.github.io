---
title: Countdown Timer
layout: page
permalink: /timer
layout: timer
---
# IROS paper submission deadline
<div id="countdown">
  <span>
    <span class="time" id="days"></span>
    <span class="label">days</span>
  </span>
  <span>
    <span class="time" id="hours"></span>
    <span class="label">hours</span>
  </span>
  <span>
    <span class="time" id="minutes"></span>
    <span class="label">minutes</span>
  </span>
  <span>
    <span class="time" id="seconds"></span>
    <span class="label">seconds</span>
  </span>
</div>



<div id="timezones">
  <div id="ist">
    <strong>IST:</strong>
    <span id="ist-date"></span>
    <span id="ist-time"></span>
    <span id="ist-day"></span>
  </div>
  <div id="pst">
    <strong>PST:</strong>
    <span id="pst-date"></span>
    <span id="pst-time"></span>
    <span id="pst-day"></span>
  </div>
  <div id="gmt">
    <strong>GMT:</strong>
    <span id="gmt-date"></span>
    <span id="gmt-time"></span>
    <span id="gmt-day"></span>
  </div>
</div>

# IROS video submission deadline
<div id="vid-countdown">
  <span>
    <span class="time" id="vid-days"></span>
    <span class="label">days</span>
  </span>
  <span>
    <span class="time" id="vid-hours"></span>
    <span class="label">hours</span>
  </span>
  <span>
    <span class="time" id="vid-minutes"></span>
    <span class="label">minutes</span>
  </span>
  <span>
    <span class="time" id="vid-seconds"></span>
    <span class="label">seconds</span>
  </span>
</div>



<div id="vid-timezones">
  <div id="ist">
    <strong>IST:</strong>
    <span id="vid-ist-date"></span>
    <span id="vid-ist-time"></span>
    <span id="vid-ist-day"></span>
  </div>
  <div id="pst">
    <strong>PST:</strong>
    <span id="vid-pst-date"></span>
    <span id="vid-pst-time"></span>
    <span id="vid-pst-day"></span>
  </div>
  <div id="gmt">
    <strong>GMT:</strong>
    <span id="vid-gmt-date"></span>
    <span id="vid-gmt-time"></span>
    <span id="vid-gmt-day"></span>
  </div>
</div>


<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.31/moment-timezone-with-data.min.js"></script>
<script>
  // Set the target date and time
  var target = moment.tz("2024-03-17T23:59:00", "America/Los_Angeles");
  var vidtarget = moment.tz("2024-03-20T23:59:00", "America/Los_Angeles");

  // Update the countdown every second
  setInterval(function() {
    // Get the current time
    var now = moment();

    // Calculate the duration between the current time and the target time
    var duration1 = moment.duration(target.diff(now));
    var duration2 = moment.duration(vidtarget.diff(now));

    // Get the days, hours, minutes, and seconds remaining
    var days = duration1.days();
    var hours = duration1.hours();
    var minutes = duration1.minutes();
    var seconds = duration1.seconds();
    
    var vid_days = duration2.days();
    var vid_hours = duration2.hours();
    var vid_minutes = duration2.minutes();
    var vid_seconds = duration2.seconds();

    // Display the countdown in the #countdown element
    document.getElementById("days").innerHTML = days;
    document.getElementById("hours").innerHTML = hours;
    document.getElementById("minutes").innerHTML = minutes;
    document.getElementById("seconds").innerHTML = seconds;
    
    document.getElementById("vid-days").innerHTML = vid_days;
    document.getElementById("vid-hours").innerHTML = vid_hours;
    document.getElementById("vid-minutes").innerHTML = vid_minutes;
    document.getElementById("vid-seconds").innerHTML = vid_seconds;
    
    
  // Set the date, time, and day in IST
  var ist = target.clone().tz("Asia/Kolkata");
  document.getElementById("ist-date").innerHTML = ist.format("MMMM DD, YYYY");
  document.getElementById("ist-time").innerHTML = ist.format("h:mm A");
  document.getElementById("ist-day").innerHTML = ist.format("dddd");

  // Set the date, time, and day in PST
  var pst = target.clone().tz("America/Los_Angeles");
  document.getElementById("pst-date").innerHTML = pst.format("MMMM DD, YYYY");
  document.getElementById("pst-time").innerHTML = pst.format("h:mm A");
  document.getElementById("pst-day").innerHTML = pst.format("dddd");

  // Set the date, time, and day in GMT
  var gmt = target.clone().utc();
  document.getElementById("gmt-date").innerHTML = gmt.format("MMMM DD, YYYY");
  document.getElementById("gmt-time").innerHTML = gmt.format("h:mm A");
  document.getElementById("gmt-day").innerHTML = gmt.format("dddd");
  
  var vid_ist = vidtarget.clone().tz("Asia/Kolkata");
  document.getElementById("vid-ist-date").innerHTML = vid_ist.format("MMMM DD, YYYY");
  document.getElementById("vid-ist-time").innerHTML = vid_ist.format("h:mm A");
  document.getElementById("vid-ist-day").innerHTML = vid_ist.format("dddd");

  // Set the date, time, and day in PST
  var vid_pst = vidtarget.clone().tz("America/Los_Angeles");
  document.getElementById("vid-pst-date").innerHTML = vid_pst.format("MMMM DD, YYYY");
  document.getElementById("vid-pst-time").innerHTML = vid_pst.format("h:mm A");
  document.getElementById("vid-pst-day").innerHTML = vid_pst.format("dddd");

  // Set the date, time, and day in GMT
  var vid_gmt = vidtarget.clone().utc();
  document.getElementById("vid-gmt-date").innerHTML = vid_gmt.format("MMMM DD, YYYY");
  document.getElementById("vid-gmt-time").innerHTML = vid_gmt.format("h:mm A");
  document.getElementById("vid-gmt-day").innerHTML = vid_gmt.format("dddd");
  }, 1000);
</script>