import Header from './components/Header';
import Form from './components/Form';

export default function Home() {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
      style={{
        fontFamily: 'Inter',
      }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="px-40 flex flex-1 justify-center py-5">
          <Form />
        </main>
      </div>
    </div>
  );
}