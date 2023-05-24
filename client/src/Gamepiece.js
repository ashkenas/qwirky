export default function Gamepiece({ value, x, y }) {
    return (
        <div className={`piece p${value & 0xF}${(value >> 4) & 0xF}`}></div>
    );
};
