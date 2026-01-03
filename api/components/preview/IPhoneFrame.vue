<script setup lang="ts">
interface Props {
  scale?: number
}

const props = withDefaults(defineProps<Props>(), {
  scale: 1,
})
</script>

<template>
  <div class="iphone-container" :style="{ transform: `scale(${scale})` }">
    <div class="iphone-frame">
      <!-- Side buttons -->
      <div class="button silent-switch"></div>
      <div class="button volume-up"></div>
      <div class="button volume-down"></div>
      <div class="button power"></div>

      <!-- Screen area -->
      <div class="screen">
        <!-- Dynamic Island -->
        <div class="dynamic-island"></div>
        
        <!-- Content slot -->
        <div class="screen-content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.iphone-container {
  transform-origin: top center;
}

.iphone-frame {
  position: relative;
  width: 433px;
  height: 882px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  border-radius: 55px;
  padding: 12px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 20px 50px rgba(0, 0, 0, 0.5),
    inset 0 0 2px rgba(255, 255, 255, 0.1);
}

/* Side buttons - Left side */
.button {
  position: absolute;
  background: linear-gradient(90deg, #1a1a1a, #333, #1a1a1a);
  border-radius: 2px;
}

.silent-switch {
  left: -3px;
  top: 120px;
  width: 3px;
  height: 30px;
}

.volume-up {
  left: -3px;
  top: 180px;
  width: 3px;
  height: 60px;
}

.volume-down {
  left: -3px;
  top: 250px;
  width: 3px;
  height: 60px;
}

/* Power button - Right side */
.power {
  right: -3px;
  top: 200px;
  width: 3px;
  height: 80px;
}

/* Screen */
.screen {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 45px;
  overflow: hidden;
}

/* Dynamic Island */
.dynamic-island {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 125px;
  height: 35px;
  background: #000;
  border-radius: 20px;
  z-index: 10;
  box-shadow: 0 0 0 3px #000;
}

/* Screen content area */
.screen-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 45px;
  overflow: hidden;
}
</style>
