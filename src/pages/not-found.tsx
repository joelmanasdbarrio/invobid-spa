import { Link } from 'react-router'

export default function NotFoundPage () {
  return (
    <div className='w-full h-full flex flex-col items-center justify-center text-3xl font-bold'>
      404 Page Not Found
      <Link to={window.history.back()} className='ml-4 text-lg font-normal underline'>Go back</Link>
    </div>
  )
}
