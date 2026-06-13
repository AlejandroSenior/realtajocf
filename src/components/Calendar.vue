<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { CalendarResponse } from '@/interfaces/Calendar';

const calendar = ref<CalendarResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const nextThreeMatches = computed(() => {
  if (!calendar.value?.matches) return [];

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const upcomingMatches = calendar.value.matches
    .filter((match) => new Date(match.date) >= currentDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return upcomingMatches.slice(0, 3);
});

const fetchCalendar = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/real-tajo/calendar`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CalendarResponse = await response.json();
    calendar.value = data;
  } catch (err) {
    console.error('Error al obtener el calendario:', err);
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    loading.value = false;
  }
};

const cutClubNames = (name: string) => {
  switch (name) {
    case 'AMG-ASESORIA JURIDICA- EXCAVACIONES TAJO':
      return 'AMG-ASESORIA';
    case 'LA VESPA TAPAS-CLUB ATLETICO DE ARANJUEZ':
      return 'LA VESPA';
    default:
      return name;
  }
};

onMounted(() => {
  fetchCalendar();
});
</script>

<template>
  <div>
    <header class="section-header">
      <p class="section-eyebrow">Calendario</p>
      <h2 class="section-title">Próximos partidos</h2>
    </header>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      <div v-for="n in 3" :key="n" class="match-card card-glass flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-5 pt-4">
          <span class="skeleton h-3 w-24 rounded"></span>
          <span class="skeleton h-5 w-16 rounded-sm"></span>
        </div>

        <div class="flex items-center gap-5 px-5 py-6">
          <div class="date-block skeleton h-20 w-16 shrink-0"></div>

          <div class="min-w-0 flex-1 space-y-2.5">
            <span class="skeleton block h-3.5 w-3/4 rounded"></span>
            <span class="skeleton block h-3 w-6 rounded"></span>
            <span class="skeleton block h-3.5 w-2/3 rounded"></span>
          </div>
        </div>

        <div class="mt-auto border-t border-white/8 px-5 py-3">
          <span class="skeleton inline-block h-3 w-32 rounded"></span>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center">
      <p class="text-red-400">Error al cargar el calendario: {{ error }}</p>
    </div>

    <!-- Calendar content -->
    <div v-else-if="calendar">
      <div v-if="nextThreeMatches.length > 0" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="match in nextThreeMatches"
          :key="`${match.matchday}-${match.date}`"
          class="match-card card-glass flex flex-col overflow-hidden"
        >
          <div class="flex items-center justify-between px-5 pt-4 text-xs tracking-[0.2em] uppercase text-white/45">
            <span>Jornada {{ match.stage !== 'Liga' ? `de ${match.stage}` : match.matchday }}</span>
            <span
              class="rounded-sm px-2 py-0.5 font-semibold"
              :class="match.is_home ? 'bg-secondary/15 text-secondary-300' : 'bg-white/8 text-white/60'"
            >
              {{ match.is_home ? 'Local' : 'Visitante' }}
            </span>
          </div>

          <div class="flex items-center gap-5 px-5 py-6">
            <!-- bloque fecha -->
            <div class="date-block flex shrink-0 flex-col items-center px-4 py-2">
              <span class="font-display text-4xl leading-none text-secondary-300">
                {{ new Date(match.date).getDate() }}
              </span>
              <span class="text-[0.65rem] tracking-[0.25em] uppercase text-white/55">
                {{ new Date(match.date).toLocaleDateString('es-ES', { month: 'short' }) }}
              </span>
              <span class="mt-1 text-xs font-semibold text-white/75">{{ match.time ?? '--:--' }}</span>
            </div>

            <!-- enfrentamiento -->
            <div class="min-w-0 flex-1">
              <p class="versus-team truncate" :class="{ 'is-tajo': match.is_home }">
                {{ match.is_home ? cutClubNames('Real Tajo CF') : cutClubNames(match.opponent) }}
              </p>
              <p class="font-display my-1 text-sm tracking-[0.3em] text-white/30">VS</p>
              <p class="versus-team truncate" :class="{ 'is-tajo': !match.is_home }">
                {{ match.is_home ? cutClubNames(match.opponent) : cutClubNames('Real Tajo CF') }}
              </p>
            </div>
          </div>

          <p class="mt-auto border-t border-white/8 px-5 py-3 text-xs tracking-wider uppercase text-white/45">
            📍 {{ match.field }}
          </p>
        </article>
      </div>

      <div v-else class="card-glass mx-auto max-w-xl py-12 text-center">
        <p class="font-display text-3xl tracking-wide text-secondary-300">
          {{
            calendar.season
              ? `Liga ${calendar.season.replace('-', '/')} finalizada`
              : 'Temporada finalizada'
          }}
        </p>
        <p class="mt-2 text-sm text-white/50">No quedan partidos programados</p>
      </div>
    </div>

    <!-- Fallback state -->
    <div v-else class="text-center">
      <p class="text-white/50">No se pudieron cargar los partidos del calendario</p>
    </div>
  </div>
</template>

<style scoped>
.match-card {
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.match-card:hover {
  transform: translateY(-5px);
  border-color: rgba(207, 164, 60, 0.35);
  box-shadow: 0 18px 40px rgba(3, 16, 41, 0.55);
}

.date-block {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
}

.versus-team {
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
  font-size: 0.9rem;
}

.versus-team.is-tajo {
  color: var(--color-secondary-300);
}
</style>
