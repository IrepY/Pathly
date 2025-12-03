import React from 'react';

const HomePage: React.FC = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-16 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-4">🚌 Pathly - Okos Útvonaltervező</h2>
          <p className="text-xl text-blue-100 mb-2">
            Találd meg a leggyorsabb, legkényelmesebb útvonalat a közösségi közlekedésben
          </p>
          <p className="text-blue-200 text-lg">
            Optimalizált útvonalak, valós idejű frissítések, mentett kedvencek
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Villámgyors</h3>
            <p className="text-gray-600">Az optimális útvonalat másodpercek alatt találja meg.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Személyre szabott</h3>
            <p className="text-gray-600">Válassz az optimalizálási stratégiák közül: leggyorsabb, legkevesebb átszállás vagy egyensúly.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mentett útvonalak</h3>
            <p className="text-gray-600">Mentsd el a gyakran használt útvonalaidat a gyors hozzáféréshez.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
