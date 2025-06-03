import { Listbox } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

interface Project {
  id: string
  name: string
}

export default function ProjectSelector() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading] = useState(false)
  const projects: Project[] = [
    { id: '1', name: 'Default Project' },
    { id: '2', name: 'Marketing Site' },
    { id: '3', name: 'E-commerce Platform' }
  ]

  if (loading) return <div className="w-40 h-8 bg-gray-200 rounded animate-pulse"></div>

  return (
    <Listbox value={selectedProject} onChange={setSelectedProject}>
      <div className="relative">
        <Listbox.Button className="relative w-40 py-1 pl-3 pr-10 text-left bg-white rounded-lg shadow-sm cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75 sm:text-sm">
          <span className="block truncate">
            {selectedProject?.name || 'Select project'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {projects.map((project) => (
            <Listbox.Option
              key={project.id}
              value={project}
              className={({ active }) =>
                `cursor-default select-none relative py-2 pl-10 pr-4 ${
                  active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`
              }
            >
              {({ selected }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    {project.name}
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                      ✓
                    </span>
                  )}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  )
}
