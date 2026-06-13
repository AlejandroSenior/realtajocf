<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ClassificationResponse, Team } from '@/interfaces/Classification.ts';

const clasificacion = ref<Team[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchClasificacion = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/classification`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ClassificationResponse = await response.json();
    clasificacion.value = data.teams;
  } catch (err) {
    console.error('Error al obtener la clasificación:', err);
    error.value = 'Error al cargar la clasificación';
    clasificacion.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchClasificacion();
});
</script>

<template>
  <div>
    <header class="section-header">
      <p class="section-eyebrow">La liga</p>
      <h2 class="section-title">Clasificación</h2>
    </header>

    <div v-if="loading" class="card-glass overflow-hidden" aria-hidden="true">
      <table class="standings w-full">
        <thead>
          <tr class="max-md:text-xs">
            <th class="w-12">Pos</th>
            <th class="!text-left">Club</th>
            <th>Pts</th>
            <th>GF</th>
            <th>GC</th>
            <th>PJ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in 10" :key="n">
            <td><span class="skeleton mx-auto block h-7 w-7 rounded-md"></span></td>
            <td class="!text-left"><span class="skeleton inline-block h-4 w-28 max-w-full rounded"></span></td>
            <td><span class="skeleton mx-auto block h-4 w-8 rounded"></span></td>
            <td><span class="skeleton mx-auto block h-4 w-6 rounded"></span></td>
            <td><span class="skeleton mx-auto block h-4 w-6 rounded"></span></td>
            <td><span class="skeleton mx-auto block h-4 w-6 rounded"></span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-400">{{ error }}</p>
    </div>

    <div v-else-if="clasificacion.length > 0" class="card-glass overflow-hidden">
      <table class="standings w-full">
        <thead>
          <tr class="max-md:text-xs">
            <th class="w-12">Pos</th>
            <th class="!text-left">Club</th>
            <th>Pts</th>
            <th>GF</th>
            <th>GC</th>
            <th>PJ</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="equipo in clasificacion"
            :key="equipo.position"
            :class="{ 'is-tajo': equipo.team === 'REAL TAJO' }"
          >
            <td>
              <span class="pos font-display" :class="{ 'pos-top': equipo.position <= 3 }">
                {{ equipo.position }}
              </span>
            </td>
            <td class="!text-left font-medium max-md:max-w-[110px] max-md:text-xs">{{ equipo.team }}</td>
            <td class="font-display text-lg text-secondary-300">{{ equipo.points }}</td>
            <td class="text-white/70">{{ equipo.goals.for }}</td>
            <td class="text-white/70">{{ equipo.goals.against }}</td>
            <td class="text-white/70">{{ equipo.matches.played }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-white/50">No hay datos de clasificación disponibles</p>
    </div>
  </div>
</template>

<style scoped>
.standings {
  border-collapse: collapse;
}

.standings th {
  padding: 14px 8px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-secondary);
  border-bottom: 1px solid rgba(207, 164, 60, 0.25);
}

.standings td {
  padding: 12px 8px;
  text-align: center;
}

.standings tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s ease;
}

.standings tbody tr:last-child {
  border-bottom: none;
}

.standings tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.pos {
  display: inline-flex;
  width: 1.9rem;
  height: 1.9rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.45rem;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.6);
}

.pos-top {
  background: rgba(207, 164, 60, 0.14);
  color: var(--color-secondary-300);
}

/* fila del Real Tajo destacada */
.is-tajo {
  background: linear-gradient(90deg, rgba(207, 164, 60, 0.16), rgba(207, 164, 60, 0.04));
  box-shadow: inset 3px 0 0 var(--color-secondary);
}

.is-tajo td {
  color: #fff;
}

@media (max-width: 768px) {
  .standings th,
  .standings td {
    padding: 9px 5px;
    font-size: 0.85rem;
  }
}
</style>
