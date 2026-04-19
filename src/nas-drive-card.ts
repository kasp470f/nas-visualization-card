import styles from './styles.css';
import { CardConfig, DriveConfig } from './types/config.type';
import { HomeAssistant } from './types/home-assistant.type';

const DEFAULT_ROWS = 1;
const DEFAULT_COLUMNS = 4;

class NasDriveCard extends HTMLElement {
	private _config: CardConfig = {};
	private _hass: HomeAssistant = {};
	private root: ShadowRoot;
	private _slots: Array<DriveConfig | null> = [];
	private _bayElements: HTMLElement[] = [];

	constructor() {
		super();
		this.root = this.attachShadow({ mode: 'open' });
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.root.appendChild(styleEl);
		const card = document.createElement('ha-card');
		const container = document.createElement('div');
		container.className = 'content';
		card.appendChild(container);
		this.root.appendChild(card);
	}

	setConfig(config: CardConfig) {
		if (!config) throw new Error('Configuration required');
		this._config = config;
		if (!this._config.rows) this._config.rows = DEFAULT_ROWS;
		if (!this._config.columns) this._config.columns = DEFAULT_COLUMNS;
		if (!this._config.orientation) this._config.orientation = 'horizontal';
		this.render();
	}

	set hass(hass: HomeAssistant) {
		this._hass = hass;
		this._updateStates();
	}

	getCardSize() {
		const rows = this._config.rows || DEFAULT_ROWS;
		return rows;
	}

	private render() {
		const container = this.root.querySelector('.content') as HTMLElement;
		if (!container) return;
		container.innerHTML = '';

		const grid = document.createElement('div');
		grid.className = 'grid';
		// apply orientation class to control bay aspect ratio
		grid.classList.add(this._config.orientation || 'horizontal');
		const cols = this._config.columns || DEFAULT_COLUMNS;
		const rows = this._config.rows || DEFAULT_ROWS;
		grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

		const total = rows * cols;
		const drives = this._config.drives || [];

		// Prepare slots and place drives by their optional 1-based `index`.
		const slots: Array<DriveConfig | null> = new Array(total).fill(null);
		let nextFree = 0;
		const findNextFree = () => {
			while (nextFree < total && slots[nextFree] !== null) nextFree++;
			return nextFree < total ? nextFree : -1;
		};

		for (const drive of drives) {
			let pos = -1;
			if (
				typeof drive.index === 'number' &&
				Number.isFinite(drive.index)
			) {
				// convert 1-based index to 0-based
				const idx = Math.floor(drive.index) - 1;
				if (idx >= 0 && idx < total && slots[idx] === null) {
					pos = idx;
				}
			}
			if (pos === -1) {
				const nf = findNextFree();
				if (nf !== -1) pos = nf;
			}
			if (pos !== -1) slots[pos] = drive;
		}

		this._bayElements = [];
		for (let i = 0; i < total; i++) {
			const bay = document.createElement('div');
			bay.className = 'bay';
			const drive = slots[i];
			if (!drive) {
				bay.classList.add('empty');
			} else {
				const label = String(i + 1).padStart(2, '0');
				const lbl = document.createElement('div');
				lbl.className = 'label';
				lbl.textContent = label;
				const led = document.createElement('span');
				led.className = 'led offline';
				bay.appendChild(led);
				bay.appendChild(lbl);
				bay.tabIndex = 0;
				bay.setAttribute('role', 'button');
				bay.setAttribute('aria-label', `Drive ${label}`);
				bay.addEventListener('click', () =>
					this._openMoreInfo(drive.entity)
				);
			}
			this._bayElements.push(bay);
			grid.appendChild(bay);
		}

		container.appendChild(grid);

		// store slots and update LED states without rebuilding DOM on hass updates
		this._slots = slots;
		this._updateStates();
	}

	private _updateStates() {
		if (!this._bayElements || !this._slots) return;
		for (let i = 0; i < this._bayElements.length; i++) {
			const bay = this._bayElements[i];
			const drive = this._slots[i];
			const led = bay.querySelector('.led') as HTMLElement | null;
			if (!drive || !led) continue;
			const stateObj = this._hass?.states?.[drive.entity];
			if (stateObj && stateObj.state != null && stateObj.state !== '') {
				led.classList.remove('offline');
				led.classList.add('online');
			} else {
				led.classList.remove('online');
				led.classList.add('offline');
			}
		}
	}

	private _openMoreInfo(entityId?: string) {
		if (!entityId) return;
		const ev = new CustomEvent('hass-more-info', {
			detail: { entityId },
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(ev);
	}
}

customElements.define('nas-drive-card', NasDriveCard);

export default NasDriveCard;
