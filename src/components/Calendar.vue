<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { CalendarResponse, Match } from '@/interfaces/Calendar';

const calendar = ref<CalendarResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const groupMatchesByMonth = (matches: Match[]) => {
  const grouped = matches.reduce((acc, match) => {
    const date = new Date(match.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        name: monthName,
        matches: [] as Match[]
      };
    }
    acc[monthKey].matches.push(match);
    return acc;
  }, {} as Record<string, { name: string; matches: Match[] }>);

  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
};

const matchesByMonth = computed(() => {
  return calendar.value ? groupMatchesByMonth(calendar.value.matches) : [];
});

const fetchCalendar = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetch('https://realtajoback-b8a4dxbxdkhtgham.westeurope-01.azurewebsites.net/api/v1/real-tajo/calendar', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CalendarResponse = await response.json();
    console.log('Datos del calendario:', data);
    calendar.value = data;
  } catch (err) {
    console.error('Error al obtener el calendario:', err);
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCalendar();
});
</script>

<template>
  <div class="calendar-wrapper">
    <!-- Loading state -->
    <div v-if="loading" class="loading-message">
      <p>Cargando calendario...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-message">
      <p>Error al cargar el calendario: {{ error }}</p>
    </div>

    <!-- Calendar content -->
    <div v-else-if="calendar">
      <h2 class="text-center text-2xl font-bold text-secondary mb-5">Calendario 2025-2026</h2>

      <div v-if="calendar.matches && calendar.matches.length > 0">
        <div v-for="[monthKey, monthData] in matchesByMonth" :key="monthKey">
          <h2 class="text-xl font-bold mb-2 mt-7">{{ monthData.name }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="match in monthData.matches"
              :key="`${match.matchday}-${match.date}`"
              class="flex flex-col justify-between shadow-xl rounded-2xl py-10 px-5 min-h-[320px] border-3 border-primary"
            >
              <div class="flex justify-between items-center">
                <span class="">Jornada {{ match.matchday }}</span>
                <span :class="`${match.is_home ? 'text-secondary' : 'text-gray-500'}`">
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
                {{
                  new Date(match.date).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }}
              </div>

              <div class="flex mx-auto items-center">
                <span class="text-pimary max-w-[150px] text-center">
                  {{ match.is_home ? 'Real Tajo CF' : match.opponent }}
                </span>

                <span class="mx-5">VS</span>

                <span class="text-gray-500 max-w-[150px] text-center">
                  {{ match.is_home ? match.opponent : 'Real Tajo CF' }}
                </span>
              </div>

              <span class="text-center text-sm">{{ match.stage }}</span>
            </div>
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
