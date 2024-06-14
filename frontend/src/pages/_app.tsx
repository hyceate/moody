import { Outlet } from 'react-router-dom';
import { Header } from '../components/header';
import './_app.css';

//component start
export default function App() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center w-full">
        <Outlet />
      </main>
    </>
  );
}
