<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { CalendarResponse, Match } from '../interfaces/Calendar';

// Estados reactivos
const loading = ref(true);
const error = ref<string | null>(null);
const lastMatch = ref<Match | null>(null);

// Función para hacer la petición a la API
const fetchCalendar = async (): Promise<CalendarResponse> => {
  const response = await fetch('https://realtajoback-b8a4dxbxdkhtgham.westeurope-01.azurewebsites.net/api/v1/real-tajo/calendar');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Función para encontrar el último partido jugado
const findLastMatch = (matches: Match[]): Match | null => {
  const currentDate = new Date('2025-10-02'); // Fecha actual: 2 de octubre de 2025

  // Filtrar partidos anteriores a la fecha actual y ordenarlos por fecha descendente
  const pastMatches = matches
    .filter(match => new Date(match.date) < currentDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return pastMatches.length > 0 ? pastMatches[0] : null;
};

// Datos computados del último partido
const homeName = computed(() => {
  if (!lastMatch.value) return 'REAL TAJO C.F.';
  return lastMatch.value.is_home ? 'REAL TAJO C.F.' : lastMatch.value.opponent;
});

const awayName = computed(() => {
  if (!lastMatch.value) return 'CELTIC C.F.';
  return lastMatch.value.is_home ? lastMatch.value.opponent : 'REAL TAJO C.F.';
});

const homeScore = ref(8);
const awayScore = ref(0);

const dateLabel = computed(() => {
  if (!lastMatch.value) return 'Septiembre 27, 2025';
  return new Date(lastMatch.value.date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });
});

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    const calendarData = await fetchCalendar();
    lastMatch.value = findLastMatch(calendarData.matches);
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
      {{ dateLabel }}
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
          <span class="text-lg tracking-wide uppercase">{{ homeName }}</span>
          <span class="mt-2 h-0.5 w-48 bg-gray-200"></span>
        </div>

        <!-- bloque marcador -->
        <div class="flex items-center">
          <!-- Home logo -->
          <div class="-mr-5 z-10">
            <img :src="homeName === 'REAL TAJO C.F.' ? '/escudo-without-bg.avif' : '/escudo-default.avif'"
              :alt="`${homeName} logo`" class="w-15" />
          </div>

          <!-- pieza izquierda -->
          <div class="score-chunk-left bg-secondary px-10 md:px-10 py-2 mr-2">
            <span class="block text-4xl md:text-5xl font-extrabold leading-none text-center">{{ homeScore }}</span>
          </div>

          <!-- separador central con “pico” -->
          <div class="score-chunk-mid bg-secondary px-10 md:px-10 py-2 ml-2">
            <span class="block text-4xl md:text-5xl font-extrabold leading-none text-center">{{ awayScore }}</span>
          </div>

          <!-- Away logo -->
          <div class="-ml-5 z-10">
            <img :src="awayName === 'REAL TAJO C.F.' ? '/escudo-without-bg.avif' : '/escudo-default.avif'"
              :alt="`${awayName} logo`" class="w-15" />
          </div>
        </div>

        <!-- Away -->
        <div class="hidden md:flex flex-col items-center min-w-56">
          <span class="text-lg tracking-wide uppercase">{{ awayName }}</span>
          <span class="mt-2 h-0.5 w-48 bg-gray-200"></span>
        </div>
      </div>

      <!-- nombres para móvil -->
      <div class="md:hidden grid grid-cols-2 gap-4 w-full px-6">
        <div class="flex flex-col text-center">
          <div class="font-medium">{{ homeName }}</div>
          <div class="mx-auto mt-2 h-0.5 w-24 bg-gray-200"></div>
        </div>
        <div class="flex flex-col justify-between text-center">
          <div class="font-medium">{{ awayName }}</div>
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
