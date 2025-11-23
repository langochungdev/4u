<template>
  <div class="snowflakes" aria-hidden="true">
    <div class="snowflake"><div class="inner">❅</div></div>
    <div class="snowflake"><div class="inner">❅</div></div>
    <div class="snowflake"><div class="inner">❅</div></div>
    <div class="snowflake"><div class="inner">❅</div></div>
    <div class="snowflake"><div class="inner">❅</div></div>
    <div class="snowflake"><div class="inner">❅</div></div>
    <div class="snowflake"><div class="inner">❅</div></div>
    <div class="snowflake"><div class="inner">❅</div></div>
    <div class="snowflake"><div class="inner">❅</div></div>
    <div class="snowflake"><div class="inner">❅</div></div>
    <div class="snowflake"><div class="inner">❅</div></div>
    <div class="snowflake"><div class="inner">❅</div></div>
  </div>
</template>

<script setup lang="ts">
// This component intentionally keeps itself small — only the DOM and styles
// required for the snowflakes effect are included here. The component is
// lazy-loaded by the main layout to improve initial home page performance.
</script>

<style scoped>
.snowflake {
  color: #fff;
  font-size: 1em;
  font-family: Arial, sans-serif;
  text-shadow: 0 0 5px #000;
}

.snowflake,.snowflake .inner{animation-iteration-count:infinite;animation-play-state:running}@keyframes snowflakes-fall{0%{transform:translateY(0) rotate(0deg)}100%{transform:translateY(110vh) rotate(360deg)}}@keyframes snowflakes-shake{0%,100%{transform:translateX(0)}50%{transform:translateX(80px)}}.snowflake{position:fixed;top:-10%;z-index:-1;-webkit-user-select:none;user-select:none;cursor:default;pointer-events:none;animation-name:snowflakes-shake;animation-duration:20s;animation-timing-function:ease-in-out}.snowflake .inner{animation:snowflakes-fall 10s linear infinite}.snowflake:nth-of-type(0){left:1%;animation-delay:0s; font-size: 0.8em;}.snowflake:nth-of-type(0) .inner{animation-delay:0s; animation-duration: 9s;}.snowflake:first-of-type{left:10%;animation-delay:1s; font-size: 1.2em;}.snowflake:first-of-type .inner,.snowflake:nth-of-type(8) .inner{animation-delay:1s; animation-duration: 11s;}.snowflake:nth-of-type(2){left:20%;animation-delay:.5s; font-size: 0.9em;}.snowflake:nth-of-type(2) .inner,.snowflake:nth-of-type(6) .inner{animation-delay:6s; animation-duration: 8s;}.snowflake:nth-of-type(3){left:30%;animation-delay:2s; font-size: 1.1em;}.snowflake:nth-of-type(11) .inner,.snowflake:nth-of-type(3) .inner{animation-delay:4s; animation-duration: 12s;}.snowflake:nth-of-type(4){left:40%;animation-delay:2s; font-size: 0.7em;}.snowflake:nth-of-type(10) .inner,.snowflake:nth-of-type(4) .inner{animation-delay:2s; animation-duration: 10s;}.snowflake:nth-of-type(5){left:50%;animation-delay:3s; font-size: 1.3em;}.snowflake:nth-of-type(5) .inner{animation-delay:8s; animation-duration: 9.5s;}.snowflake:nth-of-type(6){left:60%;animation-delay:2s; font-size: 0.6em;}.snowflake:nth-of-type(7){left:70%;animation-delay:1s; font-size: 1.4em;}.snowflake:nth-of-type(7) .inner{animation-delay:2.5s; animation-duration: 11.5s;}.snowflake:nth-of-type(8){left:80%;animation-delay:0s; font-size: 1.4em;}.snowflake:nth-of-type(9){left:90%;animation-delay:1.5s; font-size: 1.6em;}.snowflake:nth-of-type(9) .inner{animation-delay:3s; animation-duration: 8.5s;}.snowflake:nth-of-type(10){left:25%;animation-delay:0s; font-size: 1.3em;}.snowflake:nth-of-type(11){left:65%;animation-delay:2.5s; font-size: 1.5em;} 

.snowflake:nth-of-type(n+9) {
  z-index: 9999;
}
</style>
