export interface DockApp {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export const dockApps: DockApp[] = [
  { id: 'about', label: 'about', href: '/', icon: 'about' },
  { id: 'stack', label: 'stack', href: '/#stack', icon: 'stack' },
  { id: 'projects', label: 'proyectos', href: '/proyectos', icon: 'projects' },
  { id: 'aula', label: 'aula', href: '/aula', icon: 'aula' },
  { id: 'foss', label: 'foss', href: '/software-libre', icon: 'foss' },
  { id: 'arcade', label: 'arcade', href: '/arcade', icon: 'arcade' },
  { id: 'blog', label: 'blog', href: '/blog', icon: 'blog' },
  { id: 'servicios', label: 'servicios', href: '/servicios', icon: 'servicios' },
  { id: 'cv', label: 'cv', href: '/cv', icon: 'cv' },
  { id: 'contacto', label: 'contacto', href: '/contacto', icon: 'contacto' },
];
