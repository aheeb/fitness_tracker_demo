"use client";

import { useState } from "react";
import { api } from "~/trpc/react"; // Adjusted path based on typical T3 app structure

export function WorkoutForm() {
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const utils = api.useUtils();

  const createWorkout = api.workout.create.useMutation({
    onSuccess: async () => {
      // Refetch workouts after successful creation
      await utils.workout.getAll.invalidate();
      // Clear form
      setExercise("");
      setSets("");
      setReps("");
      setWeight("");
    },
    onError: (error) => {
      // Log error or show a toast notification
      console.error("Failed to create workout:", error);
      alert(`Error creating workout: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numSets = parseInt(sets, 10);
    const numReps = parseInt(reps, 10);
    const numWeight = parseInt(weight, 10);

    if (isNaN(numSets) || isNaN(numReps) || isNaN(numWeight)) {
      alert("Sets, reps, and weight must be valid numbers.");
      return;
    }
    if (exercise.trim() === "") {
        alert("Exercise cannot be empty.");
        return;
    }

    createWorkout.mutate({
      exercise,
      sets: numSets,
      reps: numReps,
      weight: numWeight,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg bg-white p-6 shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800">Log New Workout</h2>
      <div>
        <label htmlFor="exercise" className="mb-1 block text-sm font-medium text-gray-700">
          Exercise
        </label>
        <input
          id="exercise"
          type="text"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="e.g., Bench Press"
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={createWorkout.isPending}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="sets" className="mb-1 block text-sm font-medium text-gray-700">
            Sets
          </label>
          <input
            id="sets"
            type="number"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            placeholder="3"
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={createWorkout.isPending}
          />
        </div>
        <div>
          <label htmlFor="reps" className="mb-1 block text-sm font-medium text-gray-700">
            Reps
          </label>
          <input
            id="reps"
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="10"
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={createWorkout.isPending}
          />
        </div>
        <div>
          <label htmlFor="weight" className="mb-1 block text-sm font-medium text-gray-700">
            Weight (kg/lbs)
          </label>
          <input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="100"
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={createWorkout.isPending}
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        disabled={createWorkout.isPending}
      >
        {createWorkout.isPending ? "Adding..." : "Add Workout"}
      </button>
    </form>
  );
}

export function WorkoutList() {
  const { data: workouts, isLoading, error, isError } = api.workout.getAll.useQuery();

  if (isLoading) {
    return <div className="text-center text-gray-700">Loading workouts...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-600">Error fetching workouts: {error?.message}</div>;
  }

  if (!workouts || workouts.length === 0) {
    return <p className="text-center text-gray-600">No workouts logged yet. Add one above!</p>;
  }

  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow-md">
       <h2 className="text-2xl font-semibold text-gray-800">Logged Workouts</h2>
      {workouts.map((workout) => (
        <div key={workout.id} className="rounded-md border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold text-blue-700">{workout.exercise}</h3>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Sets:</span> {workout.sets}</p>
            <p><span className="font-medium">Reps:</span> {workout.reps}</p>
            <p><span className="font-medium">Weight:</span> {workout.weight}</p>
            <p><span className="font-medium">Date:</span> {new Date(workout.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
