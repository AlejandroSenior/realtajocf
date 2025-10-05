<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { LastMatch } from '@/interfaces/Calendar';

// Estados reactivos
const loading = ref(true);
const error = ref<string | null>(null);
const lastMatch = ref<LastMatch | null>(null);

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/matchdays/last`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    lastMatch.value = data.fixtures[0];
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los datos';
    console.error('Error fetching calendar:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>

  <section class="mt-20 max-lg:p-5">
    <h2 class="text-center text-3xl md:text-5xl font-extrabold tracking-wide text-primary">Último resultado</h2>

    <p class="text-sm text-center mt-3" v-if="!loading && !error">
      {{
        lastMatch?.date ?
          new Date(lastMatch?.date).toLocaleDateString('es-ES', {
            weekday: 'short',
            month: 'short',
            day: '2-digit'
          }) : 'Fecha no disponible'
      }}
    </p>

    <div v-if="loading" class="text-center mt-3">
      <p class="text-sm">Cargando último resultado...</p>
    </div>

    <div v-if="error" class="text-center mt-3">
      <p class="text-sm text-red-500">Error: {{ error }}</p>
    </div>

    <div v-if="!loading && !error" class="mt-5 flex flex-col items-center gap-5" aria-label="Match result">
      <!-- fila equipos + marcador -->
      <div class="flex items-center md:gap-5">
        <!-- Home -->
        <div class="hidden md:flex flex-col items-center min-w-56">
          <span class="text-lg tracking-wide uppercase">{{ lastMatch ? lastMatch.homeTeam : 'REAL TAJO C.F.' }}</span>
          <span class="mt-2 h-0.5 w-48 bg-gray-200"></span>
        </div>

        <!-- bloque marcador -->
        <div class="flex items-center">
          <!-- Home logo -->
          <div class="-mr-5 z-10">
            <img :src="lastMatch?.homeTeam === 'REAL TAJO' ? '/escudo-without-bg.avif' : '/escudo-default.avif'"
              :alt="`${lastMatch?.homeTeam} logo`" class="w-15" />
          </div>

          <!-- pieza izquierda -->
          <div class="score-chunk-left bg-secondary px-10 md:px-10 py-2 mr-2">
            <span class="block text-4xl md:text-5xl font-extrabold leading-none text-center">{{ lastMatch?.homeScore ??
              '-' }}</span>
          </div>

          <!-- separador central con “pico” -->
          <div class="score-chunk-mid bg-secondary px-10 md:px-10 py-2 ml-2">
            <span class="block text-4xl md:text-5xl font-extrabold leading-none text-center">{{ lastMatch?.awayScore ??
              '-' }}</span>
          </div>

          <!-- Away logo -->
          <div class="-ml-5 z-10">
            <img :src="lastMatch?.awayTeam === 'REAL TAJO' ? '/escudo-without-bg.avif' : '/escudo-default.avif'"
              :alt="`${lastMatch?.awayTeam} logo`" class="w-15" />
          </div>
        </div>

        <!-- Away -->
        <div class="hidden md:flex flex-col items-center min-w-56">
          <span class="text-lg tracking-wide uppercase">{{ lastMatch?.awayTeam }}</span>
          <span class="mt-2 h-0.5 w-48 bg-gray-200"></span>
        </div>
      </div>

      <!-- nombres para móvil -->
      <div class="md:hidden grid grid-cols-2 gap-4 w-full px-6">
        <div class="flex flex-col text-center">
          <div class="font-medium">{{ lastMatch?.homeTeam }}</div>
          <div class="mx-auto mt-2 h-0.5 w-24 bg-gray-200"></div>
        </div>
        <div class="flex flex-col justify-between text-center">
          <div class="font-medium">{{ lastMatch?.awayTeam }}</div>
          <div class="mx-auto mt-2 h-0.5 w-24 bg-gray-200"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.score-chunk-left {
  clip-path: polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%);
}

.score-chunk-mid {
  clip-path: polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%);
}
</style>
