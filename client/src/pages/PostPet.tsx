import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getErrorMessage, unwrap } from '../api'
import { NAIROBI_AREAS, SIZE, SEX, SPECIES } from '../constants/nairobi'

type Preview = { file: File; url: string }

export default function PostPet() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('dog')
  const [breed, setBreed] = useState('')
  const [age_years, setAgeYears] = useState('')
  const [age_months, setAgeMonths] = useState('')
  const [sex, setSex] = useState('unknown')
  const [size, setSize] = useState('medium')
  const [description, setDescription] = useState('')
  const [nairobi_area, setNairobiArea] = useState('Kilimani')
  const [is_vaccinated, setVaccinated] = useState(false)
  const [is_neutered, setNeutered] = useState(false)
  const [previews, setPreviews] = useState<Preview[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [previews])

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const next: Preview[] = []
    const max = Math.min(5, files.length)
    for (let i = 0; i < max; i++) {
      const file = files[i]
      next.push({ file, url: URL.createObjectURL(file) })
    }
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url))
      return next
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setSubmitting(true)
    try {
      const body = {
        name: name.trim(),
        species,
        breed: breed.trim() || null,
        age_years: age_years === '' ? null : Number(age_years),
        age_months: age_months === '' ? null : Number(age_months),
        sex,
        size,
        description: description.trim(),
        adoption_status: 'available' as const,
        nairobi_area,
        is_vaccinated,
        is_neutered,
      }
      const res = await api.post('/api/pets', body)
      const data = unwrap(res) as { pet: { id: string } }
      const petId = data.pet.id

      if (previews.length) {
        const fd = new FormData()
        previews.forEach((p) => fd.append('photos', p.file))
        await api.post(`/api/pets/${petId}/photos`, fd)
      }

      navigate(`/pet/${petId}`, { replace: true })
    } catch (e) {
      setErr(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto text-left space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-200">List a pet</h1>
        <p className="text-stone-600 dark:text-stone-100 text-sm mt-1">Add details and up to 5 photos. Large tap targets, works on mobile data.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1" htmlFor="p-name">
            Name
          </label>
          <input
            id="p-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-stone-300 px-4 text-base dark:text-gray-800"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Species
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-stone-300 px-3 bg-white text-base dark:text-gray-800"
            >
              {SPECIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="p-breed">
            Breed (optional)
            <input
              id="p-breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-stone-300 px-4 text-base dark:text-gray-800"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="p-y">
            Age (years)
            <input
              id="p-y"
              type="number"
              min={0}
              max={40}
              value={age_years}
              onChange={(e) => setAgeYears(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-stone-300 px-4 text-base dark:text-gray-800"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="p-m">
            Age (months)
            <input
              id="p-m"
              type="number"
              min={0}
              max={11}
              value={age_months}
              onChange={(e) => setAgeMonths(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-stone-300 px-4 text-base dark:text-gray-800"
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Sex
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-stone-300 px-3 bg-white text-base dark:text-gray-800"
            >
              {SEX.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Size
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-stone-300 px-3 bg-white text-base dark:text-gray-800"
            >
              {SIZE.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="p-desc">
          Description
          <textarea
            id="p-desc"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 text-base dark:text-gray-800"
          />
        </label>

        <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
          Nairobi area
          <select
            value={nairobi_area}
            onChange={(e) => setNairobiArea(e.target.value)}
            className="mt-1 w-full min-h-[48px] rounded-xl border border-stone-300 px-3 bg-white text-base dark:text-gray-800"
          >
            {NAIROBI_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 min-h-[48px] cursor-pointer">
            <input
              type="checkbox"
              checked={is_vaccinated}
              onChange={(e) => setVaccinated(e.target.checked)}
              className="w-6 h-6 rounded border-stone-300"
            />
            <span className="text-stone-800 dark:text-gray-200">Vaccinated</span>
          </label>
          <label className="flex items-center gap-3 min-h-[48px] cursor-pointer">
            <input
              type="checkbox"
              checked={is_neutered}
              onChange={(e) => setNeutered(e.target.checked)}
              className="w-6 h-6 rounded border-stone-300"
            />
            <span className="text-stone-800 dark:text-gray-200">Neutered / spayed</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2" htmlFor="p-photos">
            Photos (up to 5)
          </label>
          <input
            id="p-photos"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={onFiles}
            className="w-full min-h-[48px] text-base file:min-h-[48px] file:mr-4 file:rounded-lg file:border-0 file:bg-amber-100 file:px-4 file:font-semibold file:text-amber-900"
          />
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {previews.map((p, i) => (
                <img
                  key={i}
                  src={p.url}
                  alt=""
                  className="aspect-square object-cover rounded-lg border border-stone-200"
                />
              ))}
            </div>
          )}
        </div>

        {err && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[52px] rounded-xl bg-amber-600 text-white font-semibold text-lg active:bg-amber-700 disabled:opacity-60"
        >
          {submitting ? 'Publishing…' : 'Publish listing'}
        </button>
      </form>
    </div>
  )
}
