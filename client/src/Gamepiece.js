export default function Gamepiece({ value }) {
    return (
        <div className={`piece p${value & 0xF}${(value >> 4) & 0xF}`}></div>
    );
};
