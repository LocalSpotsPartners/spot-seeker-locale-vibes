
import { Place } from '@/types';
import mapboxgl from 'mapbox-gl';

export function createMapPopup(place: Place, map: mapboxgl.Map) {
  if (!place.coordinates) {
    console.error('Cannot create popup: missing coordinates for place', place.name);
    return null;
  }

  const popupNode = document.createElement('div');
  
  const card = document.createElement('div');
  card.className = 'bg-white p-3 rounded-md shadow-sm w-[260px]';
  
  const header = document.createElement('div');
  header.className = 'flex justify-between items-start mb-2';
  
  const title = document.createElement('h3');
  title.className = 'font-semibold text-sm';
  title.textContent = place.name;
  
  const ratingContainer = document.createElement('div');
  ratingContainer.className = 'flex items-center';
  ratingContainer.innerHTML = `
    <svg class="h-3 w-3 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-.181h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
    <span class="text-xs font-medium">${place.rating.toFixed(1)}</span>
  `;
  
  header.appendChild(title);
  header.appendChild(ratingContainer);
  
  const address = document.createElement('p');
  address.className = 'text-xs text-gray-500 mb-2';
  address.textContent = place.location.address;
  
  const features = document.createElement('div');
  features.className = 'flex flex-wrap gap-1 mb-2';
  
  const featuresToShow = place.features.slice(0, 3);
  featuresToShow.forEach(feature => {
    const badge = document.createElement('span');
    badge.className = 'bg-gray-100 text-gray-800 text-[10px] py-0.5 px-1.5 rounded';
    badge.textContent = feature;
    features.appendChild(badge);
  });
  
  if (place.features.length > 3) {
    const moreBadge = document.createElement('span');
    moreBadge.className = 'bg-gray-100 text-gray-800 text-[10px] py-0.5 px-1.5 rounded';
    moreBadge.textContent = `+${place.features.length - 3}`;
    features.appendChild(moreBadge);
  }
  
  const viewButton = document.createElement('a');
  viewButton.className = 'bg-locale-500 hover:bg-locale-600 text-white text-xs font-medium py-1 px-2 rounded block text-center w-full';
  viewButton.href = `/place/${place.id}`;
  viewButton.textContent = 'View Details';
  
  card.appendChild(header);
  card.appendChild(address);
  card.appendChild(features);
  card.appendChild(viewButton);
  
  popupNode.appendChild(card);
  
  return new mapboxgl.Popup({ offset: 25, closeButton: true })
    .setLngLat(place.coordinates)
    .setDOMContent(popupNode)
    .addTo(map);
}
