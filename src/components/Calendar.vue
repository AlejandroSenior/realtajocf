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
  <div class="calendar-wrapper mt-20 max-lg:p-5">
    <h2 class="text-center text-2xl font-bold text-secondary mb-5">Próximos partidos</h2>

    <!-- Loading state -->
    <div v-if="loading" class="text-center">
      <p>Cargando calendario...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error">
      <p>Error al cargar el calendario: {{ error }}</p>
    </div>

    <!-- Calendar content -->
    <div v-else-if="calendar">
      <div v-if="nextThreeMatches.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="match in nextThreeMatches"
            :key="`${match.matchday}-${match.date}`"
            class="flex flex-col justify-between shadow-xl rounded-2xl py-10 px-5 min-h-[250px] border-3 border-primary"
          >
            <div class="flex justify-between items-center">
              <span>Jornada {{ match.stage !== 'Liga' ? `de ${match.stage}` : match.matchday }}</span>
              <span>
                {{ match.is_home ? 'Local' : 'Visitante' }}
              </span>
            </div>

            <div class="text-center">
              {{
                new Date(match.date).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short'
                })
              }}
              <br />
              {{ match.time ?? '--:--' }}
            </div>

            <div class="flex mx-auto items-center">
              <span class="max-w-[150px] text-center bg-primary-100 rounded-full px-2 py-1">
                {{ match.is_home ? cutClubNames('Real Tajo CF') : cutClubNames(match.opponent) }}
              </span>

              <span class="mx-5">VS</span>

              <span class="max-w-[150px] text-center bg-secondary/40 rounded-full px-2 py-1">
                {{ match.is_home ? cutClubNames(match.opponent) : cutClubNames('Real Tajo CF') }}
              </span>
            </div>

            <p class="text-center">{{ match.field }}</p>
          </div>
        </div>
      </div>

      <div v-else>
        <p>No hay partidos programados</p>
      </div>
    </div>

    <!-- Fallback state -->
    <div v-else>
      <p>No se pudieron cargar los partidos del calendario</p>
    </div>
  </div>
</template>
