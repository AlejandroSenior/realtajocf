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
  <div class="mt-20 mx-auto max-lg:p-5">
    <h2 class="text-center text-2xl font-bold text-secondary mb-5">Clasificación</h2>

    <div v-if="loading" class="text-center py-8">
      <p class="text-lg">Cargando clasificación...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500 text-lg">{{ error }}</p>
    </div>

    <table v-else-if="clasificacion.length > 0" class="shadow-lg">
      <thead>
        <tr class="max-md:text-sm">
          <th>Pos</th>
          <th>Club</th>
          <th>Pts</th>
          <th>GF</th>
          <th>GC</th>
          <th>PJ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="equipo in clasificacion" :key="equipo.position">
          <td class="text-center">{{ equipo.position }}</td>
          <td class="max-md:text-xs max-w-[100px]">{{ equipo.team }}</td>
          <td>{{ equipo.points }}</td>
          <td>{{ equipo.goals.for }}</td>
          <td>{{ equipo.goals.against }}</td>
          <td>{{ equipo.matches.played }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else class="text-center py-8">
      <p class="text-lg">No hay datos de clasificación disponibles</p>
    </div>
  </div>
</template>

<style>
table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 1rem;
  overflow: hidden;
}

tr:nth-child(odd) {
  background-color: #f9f9f9;
}

th {
  background-color: var(--color-primary);
  color: white;
  padding: 12px 8px;
  text-align: center;
  font-weight: bold;
}

td {
  padding: 10px 8px;
  text-align: center;
}

@media (max-width: 768px) {
  table {
    font-size: 0.9rem;
  }

  th,
  td {
    padding: 8px 4px;
  }
}
</style>
